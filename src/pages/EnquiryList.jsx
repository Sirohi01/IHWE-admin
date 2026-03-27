import React, { useState, useEffect, useCallback } from "react";

import {
  Search,
  Download,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Filter,
  ChevronDown,
  User,
  Clock,
  Building2
} from "lucide-react";

import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import api from "../lib/api";

import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Table from "../components/table/Table";
import PageHeader from "../components/PageHeader";



const MeetingList = () => {
  /* ---------------- STATE ---------------- */
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage] = useState(8);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    pending: 0,
    resolved: 0,
    contacted: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: ""
  });

  /* ---------------- FETCH DATA ---------------- */
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        status: filters.status,
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await api.get(`/api/bookings?${queryParams}`);

      if (response.data.success) {
        setBookings(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch bookings",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, searchTerm, filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  /* ---------------- FILTER HANDLERS ---------------- */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      dateFrom: "",
      dateTo: ""
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  /* ---------------- FORMAT DATE & TIME ---------------- */
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return { date: dateStr, time: timeStr };
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            {row.status === "new" && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                New
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: "contact",
      label: "Contact",
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: "company",
      label: "Company",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{row.company || "N/A"}</span>
        </div>
      )
    },
    {
      key: "message",
      label: "Message",
      render: (row) => (
        <div className="max-w-xs">
          <p className="truncate text-sm">{row.message}</p>
          <button
            onClick={() => handleViewMessage(row)}
            className="text-blue-600 text-sm"
          >
            View full
          </button>
        </div>
      )
    },
    {
      key: "date",
      label: "Date & Time",
      render: (row) => {
        const { date, time } = formatDateTime(row.createdAt);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" /> {date}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" /> {time}
            </div>
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusUpdate(row._id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === "new"
            ? "bg-blue-100 text-blue-800"
            : row.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : row.status === "contacted"
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
            }`}
        >
          <option value="new">New</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="resolved">Resolved</option>
        </select>
      )
    }
  ];


  /* ---------------- VIEW FULL MESSAGE ---------------- */
  const handleViewMessage = (booking) => {
    Swal.fire({
      title: `Message from ${booking.name}`,
      html: `
        <div class="text-left space-y-3">
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-sm text-gray-600 mb-1"><strong>Email:</strong></p>
            <p class="text-sm">${booking.email}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-sm text-gray-600 mb-1"><strong>Phone:</strong></p>
            <p class="text-sm">${booking.phone}</p>
          </div>
          ${booking.company ? `
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-sm text-gray-600 mb-1"><strong>Company:</strong></p>
              <p class="text-sm">${booking.company}</p>
            </div>
          ` : ''}
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-sm text-gray-600 mb-2"><strong>Message:</strong></p>
            <p class="text-sm text-gray-800">${booking.message}</p>
          </div>
        </div>
      `,
      width: 600,
      confirmButtonText: "Close",
      confirmButtonColor: "#3b82f6"
    });
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This booking will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/bookings/${id}`);

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Booking deleted successfully",
          confirmButtonColor: "#3b82f6",
          timer: 2000
        });

        fetchBookings();
      } catch (error) {
        console.error("Delete error:", error);

        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete booking",
          confirmButtonColor: "#ef4444"
        });
      }
    }
  };


  /* ---------------- BULK DELETE ---------------- */
  const handleBulkDelete = async () => {
    if (!selectedRows.length) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select bookings to delete",
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    const result = await Swal.fire({
      title: "Delete Multiple Bookings?",
      text: `${selectedRows.length} booking(s) will be deleted permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await api.post("/api/bookings/bulk-delete", { ids: selectedRows });

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `${selectedRows.length} booking(s) deleted successfully`,
          confirmButtonColor: "#3b82f6",
          timer: 2000
        });

        setSelectedRows([]);
        fetchBookings();
      } catch (error) {
        console.error("Bulk delete error:", error);

        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete bookings",
          confirmButtonColor: "#ef4444"
        });
      }
    }
  };

  /* ---------------- UPDATE STATUS ---------------- */
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/api/bookings/${id}/status`, { status: newStatus });

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `Status updated to ${newStatus}`,
        confirmButtonColor: "#3b82f6",
        timer: 1500,
        showConfirmButton: false
      });

      fetchBookings();
    } catch (error) {
      console.error("Status update error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update status",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  /* ---------------- BULK STATUS UPDATE ---------------- */
  const handleBulkStatusUpdate = async (status) => {
    if (!selectedRows.length) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select bookings to update",
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    try {
      await api.post("/api/bookings/bulk-update-status", {
        ids: selectedRows,
        status
      });

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${selectedRows.length} booking(s) marked as ${status}`,
        confirmButtonColor: "#3b82f6",
        timer: 1500,
        showConfirmButton: false
      });

      setSelectedRows([]);
      fetchBookings();
    } catch (error) {
      console.error("Bulk update error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update status",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  /* ---------------- EXPORT TO EXCEL ---------------- */
  const exportToExcel = (selectedOnly = false) => {
    const dataToExport = selectedOnly
      ? bookings.filter(b => selectedRows.includes(b._id))
      : bookings;

    if (selectedOnly && !selectedRows.length) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select bookings to export",
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    if (!dataToExport.length) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "No data to export",
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    const exportData = dataToExport.map(booking => {
      const { date, time } = formatDateTime(booking.createdAt);
      return {
        "Name": booking.name,
        "Email": booking.email,
        "Phone": booking.phone,
        "Company": booking.company || "N/A",
        "Message": booking.message,
        "Date": date,
        "Time": time,
        "Status": booking.status
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Meeting Requests");
    XLSX.writeFile(wb, `meeting-requests-${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: "success",
      title: "Exported!",
      text: `Exported ${exportData.length} booking(s) successfully`,
      confirmButtonColor: "#3b82f6",
      timer: 2000,
      showConfirmButton: false
    });
  };

  /* ---------------- RENDER ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="MEETING REQUESTS"
        description="Manage meeting requests submitted by clients"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Total</p>
          <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">New</p>
          <p className="text-3xl font-bold text-green-700">{stats.new}</p>
        </div>
        <div className="bg-linear-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">Pending</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Contacted</p>
          <p className="text-3xl font-bold text-purple-700">{stats.contacted}</p>
        </div>
        <div className="bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-600 font-medium">Resolved</p>
          <p className="text-3xl font-bold text-indigo-700">{stats.resolved}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, phone, company, message..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Header */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToExcel(false)}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export All</span>
          </button>

          <button
            onClick={() => exportToExcel(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Selected</span>
          </button>
        </div>
      </div>

      {/* Filters Dropdown */}
      {showFilters && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700 font-medium">
            {selectedRows.length} booking(s) selected
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkStatusUpdate('contacted')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Mark as Contacted
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('resolved')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Mark as Resolved
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <Table
            columns={columns}
            data={bookings}
            onDelete={(row) => handleDelete(row._id)}
            onEdit={null}
          />
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No meeting requests found"
              description={searchTerm
                ? "No bookings match your search. Try a different search term."
                : "No meeting requests have been submitted yet."
              }
              actionLabel="Clear Search"
              onAction={() => setSearchTerm("")}
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalItems={stats.total}
          itemsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          label="bookings"
        />
      </div>
    </div>
  );
};

export default MeetingList;