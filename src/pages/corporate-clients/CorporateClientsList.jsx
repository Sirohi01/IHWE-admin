import { useState, useEffect } from "react";
import Table from "../../components/table/Table";
import { User, Search, Phone, Mail, Calendar, CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import api from "../../lib/api";
import { toast } from "react-toastify";

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/leads/corporate?search=${searchTerm}&status=${statusFilter}`
      );
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch corporate leads");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      inactive: "bg-red-100 text-red-800 border border-red-200",
    };
    return colors[status] || colors.pending;
  };

  const columns = [
    {
      label: "Client Details",
      key: "companyName",
      render: (row) => (
        <div className="min-w-[250px]">
          <div className="font-bold text-gray-900">{row.companyName}</div>
          <div className="text-sm text-gray-500 mt-1">ID: {row._id.slice(-6).toUpperCase()}</div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Calendar className="h-3 w-3" />
            Created: {new Date(row.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      label: "Contact Information",
      key: "contactName",
      render: (row) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-gray-900">{row.contactName}</div>
          <div className="text-sm text-gray-600 truncate">{row.contactEmail}</div>
          <div className="text-sm text-gray-600">{row.contactPhone}</div>
        </div>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
            row.status
          )}`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
  ];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = clients.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await api.delete(`/api/leads/corporate/${id}`);
      if (response.data.success) {
        toast.success("Lead deleted");
        fetchLeads();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-white rounded-md shadow-lg border border-gray-200 mt-6 min-h-screen p-6">
      <PageHeader
        title="CORPORATE CLIENTS LIST"
        description="Manage corporate leads and relationships"
      >
        <button
          onClick={fetchLeads}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <input
          type="text"
          placeholder="Search by company, contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200">
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <Table
            columns={columns}
            data={paginatedClients}
            onDelete={(row) => handleDelete(row._id)}
          />
        )}
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalItems={clients.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ClientsTable;