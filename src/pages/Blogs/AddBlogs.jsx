import { useState, useEffect, useRef } from "react";
import { List, FileText, Globe, Code, Link as LinkIcon, Image as ImageIcon, Save, Trash2, Edit, Plus, Upload, Eye as EyeIcon, Check, Zap, Building2, Sparkles, Smartphone, Heart, Smile, Search, Calendar, TrendingUp, Rocket, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api, { API_URL, SERVER_URL } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import RichTextEditor from "../../components/RichTextEditor";

const CATEGORY_OPTIONS = [
  { label: "Technology", icon: Zap },
  { label: "Industry", icon: Building2 },
  { label: "Innovation", icon: Sparkles },
  { label: "Devices", icon: Smartphone },
  { label: "Healthcare", icon: Heart },
  { label: "Wellness", icon: Smile },
  { label: "Research", icon: Search },
  { label: "News", icon: FileText },
  { label: "Events", icon: Calendar },
  { label: "Trends", icon: TrendingUp },
  { label: "Global", icon: Globe },
  { label: "Future", icon: Rocket },
  { label: "General", icon: Layers },
];


const AddBlogs = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const ogTagsRef = useRef(null);
  const schemaRef = useRef(null);

  const [blogData, setBlogData] = useState({
    title: "",
    h1Title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "General",
    categoryIcon: "Layers",
    tags: [],
    status: "draft",
    featured: false,
    metaTitle: "",
    metaDescription: "",
    imageAlt: "",
    ogTitle: "",
    ogDescription: "",
    canonicalTag: "",
    schemaMarkup: "",
    openGraphTags: "",
    metaKeywords: "",
    readTime: "5 min read"
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ogImageFile, setOgImageFile] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ================= INPUT HANDLER =================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBlogData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug from title
    if (name === "title" && !editId) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setBlogData((prev) => ({ ...prev, slug }));
    }
  };

  const getIconName = (IconComp) => {
    if (IconComp === Zap) return 'Zap';
    if (IconComp === Building2) return 'Building2';
    if (IconComp === Sparkles) return 'Sparkles';
    if (IconComp === Smartphone) return 'Smartphone';
    if (IconComp === Heart) return 'Heart';
    if (IconComp === Smile) return 'Smile';
    if (IconComp === Search) return 'Search';
    if (IconComp === FileText) return 'FileText';
    if (IconComp === Calendar) return 'Calendar';
    if (IconComp === TrendingUp) return 'TrendingUp';
    if (IconComp === Globe) return 'Globe';
    if (IconComp === Rocket) return 'Rocket';
    if (IconComp === Layers) return 'Layers';
    return 'Layers';
  };

  // ================= IMAGE HANDLER =================
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 100KB Size check
      if (file.size > 100 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Image Too Large',
          text: 'Blog feature image should not exceed 100KB. Please compress and try again.',
          confirmButtonColor: '#134698'
        });
        e.target.value = null;
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOgImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 100KB Size check
      if (file.size > 100 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Image Too Large',
          text: 'OG image should not exceed 100KB. Please compress and try again.',
          confirmButtonColor: '#134698'
        });
        e.target.value = null;
        return;
      }

      setOgImageFile(file);
      setOgImagePreview(URL.createObjectURL(file));
    }
  };

  // Replaced by RichTextEditor component

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!blogData.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter a blog title",
        confirmButtonColor: "#134698",
      });
      return;
    }

    if (!blogData.excerpt.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter a blog excerpt",
        confirmButtonColor: "#134698",
      });
      return;
    }

    if (!blogData.content.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter blog content",
        confirmButtonColor: "#134698",
      });
      return;
    }

    if (!blogData.category.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please select a category",
        confirmButtonColor: "#134698",
      });
      return;
    }

    if (!imageFile && !editId) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please upload a blog image",
        confirmButtonColor: "#134698",
      });
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", blogData.title);
      formData.append("h1Title", blogData.h1Title);
      formData.append("slug", blogData.slug);
      formData.append("excerpt", blogData.excerpt);
      formData.append("content", blogData.content);
      formData.append("category", blogData.category);
      formData.append("categoryIcon", blogData.categoryIcon);
      formData.append("readTime", blogData.readTime);
      formData.append("metaKeywords", blogData.metaKeywords);
      formData.append("status", blogData.status);
      formData.append("featured", blogData.featured);
      formData.append("metaTitle", blogData.metaTitle);
      formData.append("metaDescription", blogData.metaDescription);
      formData.append("imageAlt", blogData.imageAlt);
      formData.append("ogTitle", blogData.ogTitle);
      formData.append("ogDescription", blogData.ogDescription);
      formData.append("canonicalTag", blogData.canonicalTag);
      formData.append("schemaMarkup", blogData.schemaMarkup);
      formData.append("openGraphTags", blogData.openGraphTags);

      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (ogImageFile) {
        formData.append("ogImage", ogImageFile);
      }

      let response;
      if (editId) {
        response = await api.patch(`/api/blogs/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/api/blogs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: editId ? "Blog updated successfully" : "Blog created successfully",
          confirmButtonColor: "#134698",
          timer: 2000,
        });

        // Reset form
        setBlogData({
          title: "",
          h1Title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: "General",
          categoryIcon: "Layers",
          tags: [],
          status: "draft",
          featured: false,
          metaTitle: "",
          metaDescription: "",
          imageAlt: "",
          ogTitle: "",
          ogDescription: "",
          canonicalTag: "",
          schemaMarkup: "",
          openGraphTags: "",
          metaKeywords: "",
          readTime: "5 min read"
        });

        setImageFile(null);
        setImagePreview(null);
        setOgImageFile(null);
        setOgImagePreview(null);
        if (editorRef.current) editorRef.current.innerHTML = "";
        if (ogTagsRef.current) ogTagsRef.current.innerText = "";
        if (schemaRef.current) schemaRef.current.innerText = "";
        setEditId(null);

        navigate("/blogs-list");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to save blog",
        confirmButtonColor: "#134698",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ================= EDIT MODE =================
  useEffect(() => {
    const editBlog = JSON.parse(localStorage.getItem("editBlog"));

    if (editBlog) {
      setBlogData({
        title: editBlog.title || "",
        h1Title: editBlog.h1Title || "",
        slug: editBlog.slug || "",
        excerpt: editBlog.excerpt || "",
        content: editBlog.content || "",
        category: editBlog.category || "General",
        categoryIcon: editBlog.categoryIcon || "Layers",
        tags: editBlog.tags || [],
        status: editBlog.status || "draft",
        featured: editBlog.featured || false,
        metaTitle: editBlog.metaTitle || "",
        metaDescription: editBlog.metaDescription || "",
        imageAlt: editBlog.imageAlt || "",
        ogTitle: editBlog.ogTitle || "",
        ogDescription: editBlog.ogDescription || "",
        canonicalTag: editBlog.canonicalTag || "",
        schemaMarkup: editBlog.schemaMarkup || "",
        openGraphTags: editBlog.openGraphTags || "",
        metaKeywords: editBlog.metaKeywords || "",
        readTime: editBlog.readTime || "5 min read"
      });

      setEditId(editBlog._id);
      setImagePreview(editBlog.image ? (editBlog.image.startsWith('http') ? editBlog.image : `${SERVER_URL}${editBlog.image}`) : null);
      setOgImagePreview(editBlog.ogImage ? (editBlog.ogImage.startsWith('http') ? editBlog.ogImage : `${SERVER_URL}${editBlog.ogImage}`) : null);

      if (editorRef.current && editBlog.content) {
        editorRef.current.innerHTML = editBlog.content;
      }
      if (ogTagsRef.current && editBlog.openGraphTags) {
        ogTagsRef.current.innerText = editBlog.openGraphTags;
      }
      if (schemaRef.current && editBlog.schemaMarkup) {
        schemaRef.current.innerText = editBlog.schemaMarkup;
      }

      localStorage.removeItem("editBlog");
    }
  }, []);

  return (
    <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <PageHeader
            title={editId ? "UPDATE BLOG POST" : "CREATE NEW BLOG"}
            description="Manage your blog story and SEO details"
            buttonText="Back to List"
            buttonIcon={List}
            buttonPath="/blogs-list"
          />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
          {/* LEFT COLUMN: CONFIG & SEO (1/4) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status & Featured Card */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded">
                  <Save className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 uppercase">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">Publication Status</label>
                  <select
                    name="status"
                    value={blogData.status}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border-2 focus:outline-none transition-all rounded font-bold text-xs uppercase tracking-widest ${blogData.status === "published" || blogData.status === "active"
                      ? "bg-green-50 border-green-200 text-green-700 focus:border-green-500"
                      : "bg-red-50 border-red-200 text-red-700 focus:border-red-500"
                      }`}
                  >
                    <option value="published">● Published (Live)</option>
                    <option value="draft">○ Draft (Hidden)</option>
                    <option value="archived">○ Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={blogData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#134698] border-gray-300 rounded focus:ring-[#134698]"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-gray-700 uppercase tracking-tight cursor-pointer">
                    Add to home page
                  </label>
                </div>
              </div>
            </div>

            {/* SEO Metadata Card */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 uppercase">SEO Metadata</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Meta Title</label>
                    <span className="text-[10px] font-bold text-gray-400">{blogData.metaTitle.length}/65</span>
                  </div>
                  <input
                    type="text"
                    name="metaTitle"
                    value={blogData.metaTitle}
                    onChange={handleInputChange}
                    maxLength="65"
                    placeholder="Enter meta title"
                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded bg-white text-sm font-medium"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-700">Meta Description (SEO)</label>
                    <span className={`text-[10px] font-bold ${blogData.metaDescription.length > 155 ? 'text-red-500' : 'text-gray-400'}`}>
                      {blogData.metaDescription.length}/155
                    </span>
                  </div>
                  <textarea
                    name="metaDescription"
                    value={blogData.metaDescription}
                    onChange={handleInputChange}
                    maxLength="155"
                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded bg-white text-sm font-medium resize-none h-20"
                    placeholder="Brief summary for search results..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">Canonical Tag</label>
                  <input
                    type="text"
                    name="canonicalTag"
                    value={blogData.canonicalTag}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com/blog-post"
                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded bg-white text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Social Sharing (OG) Card */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 uppercase">Social Sharing</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">OG Title</label>
                  <input
                    type="text"
                    name="ogTitle"
                    value={blogData.ogTitle}
                    onChange={handleInputChange}
                    placeholder="Enter OG title"
                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded bg-white text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">OG Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                    <input
                      type="file"
                      onChange={handleOgImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*"
                    />
                    {ogImagePreview ? (
                      <div className="relative">
                        <img src={ogImagePreview} alt="OG Preview" className="h-24 w-full object-cover rounded" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
                          <EyeIcon className="text-white w-6 h-6" />
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Drop Image Here</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">Additional OG Tags</label>
                  <RichTextEditor
                    value={blogData.openGraphTags}
                    onChange={(val) => setBlogData(prev => ({ ...prev, openGraphTags: val }))}
                    placeholder="Paste OG meta tags here..."
                    minHeight="100px"
                    isCodeEditor={true}
                  />
                </div>
              </div>
            </div>

            {/* Schema Markup Card */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 uppercase">Schema Markup</h2>
              </div>
              <RichTextEditor
                value={blogData.schemaMarkup}
                onChange={(val) => setBlogData(prev => ({ ...prev, schemaMarkup: val }))}
                placeholder='{"@context": "https://schema.org", ...}'
                minHeight="120px"
                isCodeEditor={true}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: MAIN CONTENT (3/4) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden text-left">
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 uppercase">Blog Primary Content</h2>
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#134698] animate-pulse uppercase tracking-widest">
                    <div className="w-3 h-3 border-2 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                )}
              </div>

              <div className="p-8 space-y-8">
                {/* Horizontal Title & Slug */}
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Blog Main Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={blogData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog title..."
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#134698] font-medium text-gray-800 shadow-sm transition-all text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Hero Title (H1 for SEO)</label>
                    <input
                      type="text"
                      name="h1Title"
                      value={blogData.h1Title}
                      onChange={handleInputChange}
                      placeholder="Enter hero title (H1 for SEO)..."
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#134698] font-medium text-gray-800 shadow-sm transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Permalink / URL Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={blogData.slug}
                      onChange={handleInputChange}
                      placeholder="auto-generated-slug"
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none bg-gray-50 text-sm font-mono text-blue-600"
                      required
                    />
                  </div>
                </div>

                {/* Horizontal Summary */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Short Summary *</label>
                  <textarea
                    name="excerpt"
                    value={blogData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Provide a brief summary for list views..."
                    rows="2"
                    maxLength="500"
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#134698] text-sm font-medium resize-none shadow-sm transition-all"
                    required
                  />
                </div>

                {/* Category & Read Time */}
                <div className="grid md:grid-cols-2 gap-8 items-start text-left">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Blog Category *</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={blogData.category}
                        onChange={(e) => {
                          const selected = CATEGORY_OPTIONS.find(c => c.label === e.target.value);
                          setBlogData(prev => ({
                            ...prev,
                            category: selected.label,
                            categoryIcon: getIconName(selected.icon)
                          }));
                        }}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#134698] text-sm font-medium shadow-sm appearance-none bg-white"
                        required
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.label} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                        {(() => {
                           const IconComp = CATEGORY_OPTIONS.find(c => c.label === blogData.category)?.icon || Layers;
                           return <IconComp className="w-4 h-4 text-[#134698]" />;
                        })()}
                        <Plus className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Read Time (e.g. 5 min read)</label>
                    <input
                      type="text"
                      name="readTime"
                      value={blogData.readTime}
                      onChange={handleInputChange}
                      placeholder="e.g. 5 min read"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#134698] text-sm font-medium shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Meta Keywords Section */}
                <div className="space-y-3 text-left">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Meta Keywords (SEO)</label>
                  <textarea
                    name="metaKeywords"
                    value={blogData.metaKeywords}
                    onChange={handleInputChange}
                    placeholder="Enter keywords separated by commas..."
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#134698] text-sm font-medium resize-none shadow-sm transition-all"
                  />
                </div>

                {/* Blog Image & Alt Text Horizontal */}
                <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="w-full md:w-1/3">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Feature Image (16:5) *</label>
                    <div className="aspect-[16/5] flex items-center justify-center border-2 border-dashed border-gray-200 bg-white rounded-xl relative group overflow-hidden shadow-sm">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Blog main preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-300 mb-2" />
                          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Upload Image</span>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight text-center mt-2 leading-none">
                      Recommended: 1600 x 500 PX (16:5) | Max: 100KB
                    </p>
                  </div>
                  <div className="flex flex-col justify-center space-y-3 text-left">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Image Alt Text (SEO)</label>
                    <input
                      type="text"
                      name="imageAlt"
                      value={blogData.imageAlt}
                      onChange={handleInputChange}
                      placeholder="Describe the image..."
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#134698] text-sm font-medium shadow-sm transition-all"
                    />
                    <p className="text-[10px] text-gray-400 font-medium italic text-left">
                      ● Helps visually impaired users and improves search ranking.
                    </p>
                  </div>
                </div>

                {/* Detailed Description Editor */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between text-left">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Detailed Blog Description *</label>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded uppercase border border-green-100">Rich Text Active</span>
                  </div>

                  <div className="rounded overflow-hidden text-left">
                    <RichTextEditor
                      value={blogData.content}
                      onChange={(val) => setBlogData(prev => ({ ...prev, content: val }))}
                      placeholder="Start writing your blog content here..."
                      minHeight="450px"
                    />
                  </div>
                </div>

                {/* Submit Section */}
                <div className="pt-10 flex justify-end text-left">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group px-12 py-4 bg-[#134698] text-white font-bold rounded shadow-lg hover:bg-[#0f3470] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    )}
                    <span>{editId ? "Update Blog Post" : "Publish Blog Story"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div >
    </div >
  );
};

export default AddBlogs;