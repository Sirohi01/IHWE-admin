import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import api from "../lib/api";
import Swal from "sweetalert2";
import PageHeader from "../components/PageHeader";
import Table from "../components/table/Table";


const PageList = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [pages, setPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  /* ---------------- LOAD DATA ---------------- */
  const fetchPages = async () => {
    try {
      const response = await api.get("/api/custom-pages");
      if (response.data.success) {
        setPages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load pages',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  /* ---------------- FILTERING ---------------- */
  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || page.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredPages.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredPages.length);
  const currentPages = filteredPages.slice(startIndex, endIndex);

  /* ---------------- ACTIONS ---------------- */
  const togglePageStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await api.put(`/api/custom-pages/${id}`, { status: newStatus });
      if (response.data.success) {
        setPages(pages.map(p => p._id === id ? { ...p, status: newStatus } : p));
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Page is now ${newStatus}`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update status',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleDeletePage = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/custom-pages/${id}`);
        if (response.data.success) {
          setPages(pages.filter((p) => p._id !== id));
          Swal.fire(
            'Deleted!',
            'Your page has been deleted.',
            'success'
          );
        }
      } catch (error) {
        console.error("Error deleting page:", error);
        Swal.fire(
          'Error!',
          'Failed to delete page.',
          'error'
        );
      }
    }
  };

  const columns = [
    {
      key: "title",
      label: "PAGE TITLE",
      render: (row) => (
        <div className="font-semibold text-gray-900">{row.title}</div>
      )
    },
    {
      key: "permalink",
      label: "SLUG",
      render: (row) => (
        <div className="text-xs font-mono text-gray-400">/{row.permalink}</div>
      )
    },
    {
      key: "serviceCategory",
      label: "SERVICE CATEGORY",
      render: (row) => (
        <div className="text-xs font-medium text-gray-500 uppercase tracking-tight">
          {row.serviceCategory || "Uncategorized"}
        </div>
      )
    },
    {
      key: "date",
      label: "DATE & TIME",
      render: (row) => (
        <div className="flex flex-col text-gray-600 text-[11px] leading-tight">
          <div className="flex items-center gap-1.5 font-semibold">
            <Calendar className="w-3 h-3" />
            {new Date(row.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="pl-4.5 text-[10px] text-gray-400 mt-1">
            {new Date(row.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            })}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      headerClassName: "text-center",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center">
          <button
            onClick={() => togglePageStatus(row._id, row.status)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-medium uppercase transition-all ${row.status === "active"
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100/50"
              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/50"
              }`}
          >
            {row.status === "active" ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Active
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Inactive
              </>
            )}
          </button>
        </div>
      ),
    },
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white shadow-md mt-6 p-6">
      <div className="w-full">
        <PageHeader
          title="PAGE LISTING"
          description="Manage and monitor all your dynamic page content"
        />

        <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
          {/* Header Bar */}
          <div className="px-6 py-5 border-b bg-[#1e3a8a]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Portfolio Pages
                </h2>
                <p className="text-sm text-blue-100 mt-0.5">
                  Showing {currentPages.length} of {filteredPages.length} records
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg"
                  />
                </div>

                <button
                  onClick={() => navigate("/create-a-page")}
                  className="px-6 py-3 bg-[#9E2A3A] text-white font-bold transition-all shadow-lg hover:shadow-xl hover:bg-[#7a212d] flex items-center gap-2 uppercase tracking-wider text-xs whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add New Page
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white min-h-[400px]">
            {currentPages.length > 0 ? (
              <Table
                columns={columns}
                data={currentPages}
                onEdit={(row) =>
                  navigate("/create-a-page", {
                    state: { pageId: row.permalink },
                  })
                }
                onDelete={(row) => handleDeletePage(row._id)}
              />
            ) : (
              <div className="py-20">
                <EmptyState
                  title="No pages found"
                  description={searchTerm ? "No pages match your search criteria." : "You haven't added any page yet."}
                  actionLabel="Add Page"
                  onAction={() => navigate("/create-a-page")}
                />
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPages.length}
              itemsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageList;