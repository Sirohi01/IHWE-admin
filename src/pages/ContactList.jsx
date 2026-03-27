import React, { useState, useEffect } from "react";
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
  PhoneCall,
  MessageSquare
} from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import api from "../lib/api";

import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Table from "../components/table/Table";
import PageHeader from "../components/PageHeader";



const ContactList = () => {
  /* ---------------- STATE ---------------- */
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(25);
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
  const fetchContacts = async () => {
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

      const response = await api.get(`/api/contacts?${queryParams}`);

      if (response.data.success) {
        setContacts(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage, rowsPerPage, searchTerm, filters]);

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

  /* ---------------- VIEW FULL MESSAGE ---------------- */
  const handleViewMessage = (contact) => {
    Swal.fire({
      title: `Message from ${contact.name}`,
      html: `
        <div class="text-left space-y-3">
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-sm text-gray-600 mb-1"><strong>Email:</strong></p>
            <p class="text-sm">${contact.email}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-sm text-gray-600 mb-1"><strong>Phone:</strong></p>
            <p class="text-sm">${contact.phone}</p>
          </div>
          ${contact.service ? `
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-sm text-gray-600 mb-1"><strong>Service:</strong></p>
              <p class="text-sm">${contact.service}</p>
            </div>
          ` : ''}
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-sm text-gray-600 mb-2"><strong>Message:</strong></p>
            <p class="text-sm text-gray-800">${contact.message}</p>
          </div>
        </div>
      `,
      width: 600,
      confirmButtonText: "Close",
      confirmButtonColor: "#3b82f6"
    });
  };

  /* ---------------- CALL HANDLER ---------------- */
  const handleCall = (phone) => {
    Swal.fire({
      title: "Make a Call?",
      html: `
        <p class="text-lg mb-4">Call: <strong>${phone}</strong></p>
        <p class="text-sm text-gray-600">This will open your phone dialer</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Call Now",
      confirmButtonColor: "#10b981",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = `tel:${phone}`;
        toast.success("Opening dialer...");
      }
    });
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This contact will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/contacts/${id}`);
        toast.success("Contact deleted successfully");
        fetchContacts();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete contact");
      }
    }
  };

  /* ---------------- BULK DELETE ---------------- */
  const handleBulkDelete = async () => {
    if (!selectedRows.length) {
      toast.warning("Please select contacts to delete");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Multiple Contacts?",
      text: `${selectedRows.length} contact(s) will be deleted permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await api.post("/api/contacts/bulk-delete", { ids: selectedRows });
        toast.success(`${selectedRows.length} contact(s) deleted successfully`);
        setSelectedRows([]);
        fetchContacts();
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete contacts");
      }
    }
  };

  /* ---------------- UPDATE STATUS ---------------- */
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/api/contacts/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchContacts();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    }
  };

  /* ---------------- BULK STATUS UPDATE ---------------- */
  const handleBulkStatusUpdate = async (status) => {
    if (!selectedRows.length) {
      toast.warning("Please select contacts to update");
      return;
    }

    try {
      await api.post("/api/contacts/bulk-update-status", {
        ids: selectedRows,
        status
      });
      toast.success(`${selectedRows.length} contact(s) marked as ${status}`);
      setSelectedRows([]);
      fetchContacts();
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Failed to update status");
    }
  };

  /* ---------------- EXPORT TO EXCEL ---------------- */
  const exportToExcel = (selectedOnly = false) => {
    const dataToExport = selectedOnly
      ? contacts.filter(c => selectedRows.includes(c._id))
      : contacts;

    if (selectedOnly && !selectedRows.length) {
      toast.warning("Please select contacts to export");
      return;
    }

    if (!dataToExport.length) {
      toast.warning("No data to export");
      return;
    }

    const exportData = dataToExport.map(contact => {
      const { date, time } = formatDateTime(contact.createdAt);
      return {
        "Name": contact.name,
        "Email": contact.email,
        "Phone": contact.phone,
        "Service": contact.service || "N/A",
        "Message": contact.message,
        "Date": date,
        "Time": time,
        "Status": contact.status
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contact Requests");
    XLSX.writeFile(wb, `contact-requests-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success(`Exported ${exportData.length} contact(s) successfully`);
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
      key: "service",
      label: "Service",
      render: (row) => (
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <span>{row.service || "N/A"}</span>
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
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleCall(row.phone)}
            className="p-2 hover:bg-green-50 rounded-md text-green-600"
          >
            <PhoneCall className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleViewMessage(row)}
            className="p-2 hover:bg-blue-50 rounded-md text-blue-600"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 hover:bg-red-50 rounded-md text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];


  /* ---------------- RENDER ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md mt-6 p-4 md:p-6">
      <PageHeader
        title="CONTACT REQUESTS"
        description="Manage contact form submissions from website"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Total</p>
          <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">New</p>
          <p className="text-3xl font-bold text-green-700">{stats.new}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">Pending</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Contacted</p>
          <p className="text-3xl font-bold text-purple-700">{stats.contacted}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
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
            placeholder="Search by name, email, phone, service, message..."
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
            {selectedRows.length} contact(s) selected
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

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={contacts}
          />
        </div>

        {/* Empty State */}
        {contacts.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No contact requests found"
              description={searchTerm
                ? "No contacts match your search. Try a different search term."
                : "No contact requests have been submitted yet."
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
          label="contacts"
        />
      </div>
    </div>
  );
};

export default ContactList;