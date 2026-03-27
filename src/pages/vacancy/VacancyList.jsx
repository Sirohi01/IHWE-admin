import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SearchBar } from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import api from "../../lib/api";
import Table from "../../components/table/Table";

const VacancyList = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    fetchVacancies();
  }, [searchTerm, statusFilter, currentPage, rowsPerPage]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/vacancies", {

        params: {
          page: currentPage,
          limit: rowsPerPage,
          search: searchTerm,
          status: statusFilter,
        },
      });

      if (response.data.success) {
        setVacancies(response.data.data);
        setStats(response.data.stats || { total: 0, active: 0, inactive: 0 });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch vacancies",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredVacancies = vacancies;

  /* ---------------- PAGINATION ---------------- */
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentVacancies = filteredVacancies;

  /* ---------------- ACTIONS ---------------- */

  // Toggle Status
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await api.patch(`/api/vacancies/${id}/status`, {

        status: newStatus,
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Status Updated!",
          text: `Vacancy ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
          confirmButtonColor: "#3b82f6",
          timer: 1500,
        });
        fetchVacancies();
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update status",
        confirmButtonColor: "#ef4444",
      });
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
        const response = await api.delete(`/api/vacancies/${id}`);


        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Vacancy has been deleted.",
            confirmButtonColor: "#3b82f6",
            timer: 1500,
          });
          fetchVacancies();
          setSelectedRows([]);
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete vacancy",
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
      text: `Delete ${selectedRows.length} selected vacancies?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.post("/api/vacancies/bulk-delete", {

          ids: selectedRows,
        });

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `${response.data.deletedCount} vacancies deleted successfully`,
            confirmButtonColor: "#3b82f6",
            timer: 1500,
          });
          fetchVacancies();
          setSelectedRows([]);
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete vacancies",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const columns = [
    {
      key: "checkbox",
      label: (
        <input
          type="checkbox"
          checked={
            selectedRows.length === currentVacancies.length &&
            currentVacancies.length > 0
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(currentVacancies.map(v => v._id));
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
      key: "title",
      label: "JOB TITLE",
      render: (row) => (
        <span className="font-medium text-gray-800">{row.title}</span>
      ),
    },

    {
      key: "experience",
      label: "EXPERIENCE",
      render: (row) => row.experience,
    },

    {
      key: "location",
      label: "LOCATION",
      render: (row) => row.location,
    },

    {
      key: "vacancyCount",
      label: "VACANCIES",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Users className="w-4 h-4" />
          {row.vacancyCount || 1}
        </div>
      ),
    },

    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <button
          onClick={() => toggleStatus(row._id, row.status)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </button>
      ),
    },

    {
      key: "createdAt",
      label: "CREATED",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-IN"),
    },

    {
      key: "actions",
      label: "ACTIONS",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 hover:bg-green-50 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-green-600" />
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

  // Handle Edit
  const handleEdit = (vacancy) => {
    navigate("/add-vacancy", { state: vacancy });
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      {/* Header */}
      <PageHeader
        title="VACANCY LIST"
        description="Manage and view all job vacancies"
        buttonText="Add Vacancy"
        buttonIcon={Plus}
        buttonPath="/add-vacancy"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vacancies</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
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
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-md ${statusFilter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-2 rounded-md ${statusFilter === "active"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-4 py-2 rounded-md ${statusFilter === "inactive"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Inactive
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
            <Table
              columns={columns}
              data={currentVacancies}
            />

            {currentVacancies.length === 0 && (
              <EmptyState
                title="No vacancies found"
                description="You haven't added any vacancies yet."
                actionLabel="Add Vacancy"
                onAction={() => navigate("/add-vacancy")}
              />
            )}
          </div>

          {/* Pagination */}
          {currentVacancies.length > 0 && (
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

export default VacancyList;