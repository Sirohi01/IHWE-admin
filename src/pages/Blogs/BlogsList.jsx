import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/table/Table";
import { Plus, Eye, X, Zap, Building2, Sparkles, Smartphone, Heart, Smile, Search as SearchIcon, FileText, Calendar, TrendingUp, Rocket, Layers } from "lucide-react";
import { SearchBar } from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import Swal from "sweetalert2";
import api, { API_URL, SERVER_URL } from "../../lib/api";
import PageHeader from "../../components/PageHeader";


const BlogsList = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // LOAD BLOGS FROM API
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/blogs");

      if (response.data.success) {
        setBlogs(response.data.data);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch blogs",
        confirmButtonColor: "#134698",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `Do you want to delete <strong>${row.title}</strong>?<br><span class="text-red-600">This action cannot be undone!</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-sm",
        confirmButton: "px-6 py-3 font-semibold",
        cancelButton: "px-6 py-3 font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const response = await api.delete(`/api/blogs/${row._id}`);

        if (response.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Blog has been deleted successfully",
            confirmButtonColor: "#134698",
            timer: 2000,
          });
          fetchBlogs();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete blog",
          confirmButtonColor: "#134698",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // EDIT
  const handleEdit = (row) => {
    localStorage.setItem("editBlog", JSON.stringify(row));
    navigate("/add-blogs");
  };

  // VIEW
  const handleView = (row) => {
    setSelectedBlog(row);
    setViewModalOpen(true);
  };

  // FILTER
  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchValue.toLowerCase()) ||
      (blog.excerpt || "").toLowerCase().includes(searchValue.toLowerCase()) ||
      (blog.category || "").toLowerCase().includes(searchValue.toLowerCase())
  );

  // PAGINATION LOGIC

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedBlogs =
    rowsPerPage === blogs.length
      ? filteredBlogs
      : filteredBlogs.slice(startIndex, startIndex + rowsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, rowsPerPage]);

  // TABLE COLUMNS - COMPACT & OPTIMIZED
  const columns = [
    {
      key: "sno",
      label: "S.NO",
      width: "50px",
      render: (row, index) => (
        <div className="font-bold text-gray-900 text-center">{startIndex + index + 1}</div>
      ),
    },
    {
      key: "image",
      label: "IMAGE",
      width: "80px",
      render: (row) =>
        row.image ? (
          <img
            src={`${SERVER_URL}${row.image}`}
            alt="blog"
            className="w-16 h-12 object-cover rounded border border-gray-200"
          />
        ) : (
          <span className="text-gray-400 text-xs">N/A</span>
        ),
    },
    {
      key: "title",
      label: "TITLE",
      width: "200px",
      render: (row) => (
        <div className="font-medium text-gray-900 text-sm" title={row.title}>
          <div className="line-clamp-2">{row.title}</div>
        </div>
      ),
    },
    {
      key: "slug",
      label: "SLUG",
      width: "180px",
      render: (row) => (
        <div className="text-xs text-gray-600 font-mono truncate" title={row.slug}>
          {row.slug}
        </div>
      ),
    },
    {
      key: "category",
      label: "CATEGORY",
      width: "130px",
      render: (row) => {
        const icons = {
          Zap, Building2, Sparkles, Smartphone, Heart, Smile, Search: SearchIcon, FileText, Calendar, TrendingUp, Rocket, Layers
        };
        const IconComp = icons[row.categoryIcon] || Layers;
        return (
          <div className="flex items-center gap-2">
            <IconComp className="w-3.5 h-3.5 text-[#134698]" />
            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold whitespace-nowrap uppercase">
              {row.category}
            </span>
          </div>
        );
      },
    },

    {
      key: "status",
      label: "STATUS",
      width: "90px",
      render: (row) => (
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${row.status === "published"
            ? "bg-green-100 text-green-700"
            : row.status === "draft"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
            }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      key: "featured",
      label: "HOME PAGE",
      width: "100px",
      render: (row) => (
        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${row.featured ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-gray-100 text-gray-500"
          }`}>
          {row.featured ? "ON HOME" : "NO"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "DATE",
      width: "100px",
      render: (row) => (
        <div className="text-xs text-gray-700 whitespace-nowrap">
          <div>{new Date(row.createdAt).toLocaleDateString()}</div>
          <div className="text-[10px] text-gray-500">
            {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
      {/* HEADER */}
      <PageHeader
        title="BLOGS LIST"
        description="Manage all your blog posts"
        buttonText="Add Blog"
        buttonIcon={Plus}
        buttonPath="/add-blogs"
      />

      {/* SEARCH BAR */}
      <SearchBar
        rowsPerPage={rowsPerPage}
        totalItems={filteredBlogs.length}
        onRowsPerPageChange={setRowsPerPage}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search blogs..."
      />

      {/* TABLE WITH OVERFLOW */}
      {/* TABLE */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <Table
            columns={columns}
            data={paginatedBlogs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </div>
      )}

      {/* PAGINATION */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredBlogs.length}
          itemsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          label="blogs"
        />
      </div>

      {/* VIEW MODAL */}
      {viewModalOpen && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* MODAL HEADER */}
            <div className="bg-[#1e3a8a] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Blog Preview</h2>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* IMAGE */}
              {selectedBlog.image && (
                <div className="mb-6">
                  <img
                    src={`${SERVER_URL}${selectedBlog.image}`}
                    alt={selectedBlog.title}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* TITLE */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedBlog.title}
              </h1>

              {/* META INFO */}
              <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Category:</span>{" "}
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {selectedBlog.category}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Read Time:</span>{" "}
                  {selectedBlog.readTime}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Read Time:</span>{" "}
                  {selectedBlog.readTime}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded ${selectedBlog.status === "published"
                      ? "bg-green-100 text-green-700"
                      : selectedBlog.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {selectedBlog.status.charAt(0).toUpperCase() +
                      selectedBlog.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Views:</span>{" "}
                  {selectedBlog.views || 0}
                </div>
                {selectedBlog.featured && (
                  <div className="text-sm">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded font-semibold">
                      ⭐ Featured
                    </span>
                  </div>
                )}
              </div>

              {/* SLUG */}
              <div className="mb-4">
                <span className="text-sm font-semibold text-gray-700">
                  Slug:
                </span>
                <code className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                  {selectedBlog.slug}
                </code>
              </div>

              {/* EXCERPT */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Excerpt
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedBlog.excerpt}
                </p>
              </div>

              {/* CONTENT */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Content
                </h3>
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>

              {/* TAGS */}
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* META FIELDS */}
              {(selectedBlog.metaTitle || selectedBlog.metaDescription) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    SEO Meta Information
                  </h3>
                  {selectedBlog.metaTitle && (
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Meta Title:
                      </span>
                      <p className="text-gray-600 text-sm mt-1">
                        {selectedBlog.metaTitle}
                      </p>
                    </div>
                  )}
                  {selectedBlog.metaDescription && (
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        Meta Description:
                      </span>
                      <p className="text-gray-600 text-sm mt-1">
                        {selectedBlog.metaDescription}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TIMESTAMPS */}
              <div className="pt-4 border-t text-sm text-gray-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold">Created:</span>{" "}
                    {new Date(selectedBlog.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">Updated:</span>{" "}
                    {new Date(selectedBlog.updatedAt).toLocaleString()}
                  </div>
                </div>
                {selectedBlog.publishedAt && (
                  <div className="mt-2">
                    <span className="font-semibold">Published:</span>{" "}
                    {new Date(selectedBlog.publishedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEdit(selectedBlog);
                }}
                className="px-6 py-2 bg-[#134698] text-white font-semibold hover:bg-[#0f3470] transition-colors shadow-lg"
              >
                Edit Blog
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition-colors shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsList;