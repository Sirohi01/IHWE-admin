import { useState, useEffect } from "react";
import {
  Trash2,
  Phone,
  Eye,
  Download,
  Mail,
} from "lucide-react";
import Swal from "sweetalert2";
import { SearchBar } from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/table/Table";
import api, { API_URL } from "../../lib/api";

const CareerList = () => {
  /* ---------------- STATE ---------------- */
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    contacted: 0,
  });

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter, currentPage, rowsPerPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/career", {

        params: {
          page: currentPage,
          limit: rowsPerPage,
          search: searchTerm,
          status: statusFilter,
        },
      });

      if (response.data.success) {
        setApplications(response.data.data);
        setStats(
          response.data.stats || {
            total: 0,
            new: 0,
            reviewed: 0,
            shortlisted: 0,
            rejected: 0,
            contacted: 0,
          }
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch applications",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredApplications = applications;

  /* ---------------- ACTIONS ---------------- */

  // Make Call
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // Send Email
  const handleEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  // View Application Details
  const viewDetails = (application) => {
    Swal.fire({
      title: `<strong>${application.name}</strong>`,
      html: `
        <div class="text-left space-y-3">
          <div class="flex items-center gap-2 text-sm">
            <strong class="w-24">Phone:</strong>
            <span>${application.phone}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <strong class="w-24">Email:</strong>
            <span>${application.email}</span>
          </div>
          ${application.subject
          ? `
          <div class="flex items-center gap-2 text-sm">
            <strong class="w-24">Subject:</strong>
            <span>${application.subject}</span>
          </div>
          `
          : ""
        }
          <div class="text-sm mt-4">
            <strong>Message:</strong>
            <p class="mt-2 p-3 bg-gray-50 rounded border">${application.message}</p>
          </div>
          ${application.document
          ? `
          <div class="text-sm mt-4">
            <strong>Document:</strong>
            <a 
              href="${API_URL.replace("/api", "")}${application.document}" 
              target="_blank"
              class="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              View Document
            </a>
          </div>
          `
          : ""
        }
          <div class="flex items-center gap-2 text-sm mt-4">
            <strong class="w-24">Status:</strong>
            <span class="px-3 py-1 rounded-full text-xs ${getStatusColor(application.status)}">
              ${application.status.toUpperCase()}
            </span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <strong class="w-24">Applied:</strong>
            <span>${new Date(application.createdAt).toLocaleString("en-IN")}</span>
          </div>
        </div>
      `,
      width: 600,
      confirmButtonColor: "#3b82f6",
      confirmButtonText: "Close",
    });
  };

  // Get Status Color
  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      reviewed: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      contacted: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Change Status
  const changeStatus = async (id, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: "Change Status",
      input: "select",
      inputOptions: {
        new: "New",
        reviewed: "Reviewed",
        shortlisted: "Shortlisted",
        rejected: "Rejected",
        contacted: "Contacted",
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Update",
      inputValidator: (value) => {
        if (!value) {
          return "Please select a status!";
        }
      },
    });

    if (newStatus) {
      try {
        const response = await api.patch(`/api/career/${id}/status`, {
          status: newStatus,
        });


        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Status Updated!",
            text: "Application status updated successfully",
            confirmButtonColor: "#3b82f6",
            timer: 1500,
          });
          fetchApplications();
        }
      } catch (error) {
        console.error("Update status error:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to update status",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  // Delete Single
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/career/${id}`);


        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Application has been deleted.",
            confirmButtonColor: "#3b82f6",
            timer: 1500,
          });
          fetchApplications();
          setSelectedRows([]);
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete application",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${selectedRows.length} selected applications?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.post("/api/career/bulk-delete", {
          ids: selectedRows,
        });


        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `${response.data.deletedCount} applications deleted successfully`,
            confirmButtonColor: "#3b82f6",
            timer: 1500,
          });
          fetchApplications();
          setSelectedRows([]);
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete applications",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  // Download Document
  const downloadDocument = (documentPath, name) => {
    const fullUrl = `${API_URL.replace("/api", "")}${documentPath}`;
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = `${name}_resume`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // table
  const columns = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={
            selectedRows.length === filteredApplications.length &&
            filteredApplications.length > 0
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(filteredApplications.map((a) => a._id));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row._id)}
          onChange={() =>
            setSelectedRows((prev) =>
              prev.includes(row._id)
                ? prev.filter((id) => id !== row._id)
                : [...prev, row._id]
            )
          }
        />
      ),
    },

    {
      key: "name",
      label: "NAME",
      render: (row) => (
        <span className="font-medium text-gray-800">{row.name}</span>
      ),
    },

    {
      key: "phone",
      label: "PHONE",
      render: (row) => row.phone,
    },

    {
      key: "email",
      label: "EMAIL",
      render: (row) => (
        <span className="text-sm text-gray-600">{row.email}</span>
      ),
    },

    {
      key: "subject",
      label: "SUBJECT",
      render: (row) => row.subject || "-",
    },

    {
      key: "document",
      label: "DOCUMENT",
      render: (row) =>
        row.document ? (
          <button
            onClick={() => downloadDocument(row.document, row.name)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs"
          >
            <Download className="w-3 h-3" />
            View
          </button>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },

    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <button
          onClick={() => changeStatus(row._id, row.status)}
          className={`px-3 py-1 rounded-full text-xs ${getStatusColor(row.status)}`}
        >
          {row.status.toUpperCase()}
        </button>
      ),
    },

    {
      key: "createdAt",
      label: "DATE & TIME",
      render: (row) => (
        <div className="text-sm text-gray-600">
          {new Date(row.createdAt).toLocaleDateString("en-IN")}
          <br />
          {new Date(row.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },

    {
      key: "actions",
      label: "ACTIONS",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => viewDetails(row)}
            className="p-2 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={() => handleCall(row.phone)}
            className="p-2 hover:bg-green-50 rounded"
            title="Call"
          >
            <Phone className="w-4 h-4 text-green-600" />
          </button>

          <button
            onClick={() => handleEmail(row.email)}
            className="p-2 hover:bg-purple-50 rounded"
            title="Email"
          >
            <Mail className="w-4 h-4 text-purple-600" />
          </button>

          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];


  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white shadow-md mt-6 p-6">
      {/* Header */}
      <PageHeader
        title="CAREER APPLICATIONS"
        description="Manage job applications from candidates"

      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-xl font-bold text-gray-800">{stats.total}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-gray-600">New</p>
          <p className="text-xl font-bold text-blue-600">{stats.new}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-gray-600">Reviewed</p>
          <p className="text-xl font-bold text-yellow-600">{stats.reviewed}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-gray-600">Shortlisted</p>
          <p className="text-xl font-bold text-green-600">{stats.shortlisted}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs text-gray-600">Rejected</p>
          <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-gray-600">Contacted</p>
          <p className="text-xl font-bold text-purple-600">{stats.contacted}</p>
        </div>
      </div>

      {/* SearchBar */}
      <div className="mb-4">
        <SearchBar
          rowsPerPage={rowsPerPage}
          totalItems={stats.total}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setCurrentPage(1);
          }}
          searchValue={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
        />

        {/* Status Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-md text-sm ${statusFilter === "all"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("new")}
            className={`px-4 py-2 rounded-md text-sm ${statusFilter === "new"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            New
          </button>
          <button
            onClick={() => setStatusFilter("reviewed")}
            className={`px-4 py-2 rounded-md text-sm ${statusFilter === "reviewed"
              ? "bg-yellow-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Reviewed
          </button>
          <button
            onClick={() => setStatusFilter("shortlisted")}
            className={`px-4 py-2 rounded-md text-sm ${statusFilter === "shortlisted"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Shortlisted
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-md text-sm ${statusFilter === "rejected"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setStatusFilter("contacted")}
            className={`px-4 py-2 rounded-md text-sm ${statusFilter === "contacted"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Contacted
          </button>
        </div>
      </div>

      {/* Bulk Delete */}
      {selectedRows.length > 0 && (
        <button
          onClick={handleBulkDelete}
          className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Selected ({selectedRows.length})
        </button>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-x-auto">
            <Table columns={columns} data={filteredApplications} />

            {filteredApplications.length === 0 && (
              <EmptyState
                title="No applications found"
                description="No career applications have been submitted yet."
              />
            )}
          </div>

          {/* Pagination */}
          {filteredApplications.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={stats.total}
                itemsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CareerList;