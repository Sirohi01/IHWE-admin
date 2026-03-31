import { useState, useEffect } from "react";
import Table from "../../components/table/Table";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import { Search, Phone, Calendar, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../lib/api";

const IndividualClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      label: "S.NO",
      key: "sno",
      render: (row, index) => (
        <span className="font-semibold text-gray-900">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      ),
    },
    {
      label: "Contact",
      key: "fullName",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.fullName}</div>
          <div className="text-sm text-gray-500 flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {row.mobileNumber}
          </div>
        </div>
      ),
    },
    {
      label: "City / State",
      key: "location",
      render: (row) => (
        <div className="text-sm text-gray-600">
          {row.city}, {row.state}
        </div>
      ),
    },
    {
      label: "Enquiry For",
      key: "enquiryFor",
      render: (row) => row.enquiryFor || "N/A",
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      label: "Added On",
      key: "createdAt",
      render: (row) => (
        <div className="text-sm text-gray-700">
          <Calendar className="h-3 w-3 inline mr-1" />
          {new Date(row.createdAt).toLocaleDateString("en-IN")}
        </div>
      ),
    },
  ];

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchTerm]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/leads/individual?search=${searchTerm}`
      );
      if (response.data.success) {
        setClients(response.data.data);
        setFilteredClients(response.data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await api.delete(`/api/leads/individual/${id}`);
      if (response.data.success) {
        toast.success("Lead deleted successfully");
        fetchLeads();
      }
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="CRM INDIVIDUAL LEADS"
        description={`Found: ${filteredClients.length} leads`}
      >
        <button
          onClick={fetchLeads}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw
            className={`h-5 w-5 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </PageHeader>

      <div className="my-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
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
          totalItems={filteredClients.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default IndividualClientList;