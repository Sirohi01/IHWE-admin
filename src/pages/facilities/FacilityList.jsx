import Table from "../../components/table/Table";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import api from "../../lib/api";

const FacilitiesList = () => {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/facilities");
      if (response.data.success) {
        setFacilities(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch facilities");
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === "Active"
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      {status}
    </span>
  );

  const filteredFacilities = facilities.filter((facility) =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedFacilities = filteredFacilities.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleEdit = (facility) => {
    navigate("/add-facilities", { state: { facility } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this facility?"))
      return;
    try {
      const response = await api.delete(`/api/facilities/${id}`);
      if (response.data.success) {
        toast.success("Facility deleted successfully");
        fetchFacilities();
      }
    } catch (error) {
      toast.error("Failed to delete facility");
    }
  };

  const columns = [
    {
      label: "S.NO",
      key: "sno",
      render: (row, index) => (
        <span className="font-semibold text-gray-900">
          {startIndex + index + 1}
        </span>
      ),
    },
    {
      label: "Name",
      key: "name",
    },
    {
      label: "Status",
      key: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <div className="w-full">
        <PageHeader
          title="FACILITIES LIST"
          description="Manage and view all your facilities"
          buttonText="Add Facility"
          buttonIcon={Plus}
          buttonPath="/add-facilities"
        />

        <SearchBar
          rowsPerPage={rowsPerPage}
          totalItems={filteredFacilities.length}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setCurrentPage(1);
          }}
          searchValue={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search facilities..."
        />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={paginatedFacilities}
              onEdit={(row) => handleEdit(row)}
              onDelete={(row) => handleDelete(row._id)}
            />
          )}

          <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredFacilities.length}
              itemsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {!loading && filteredFacilities.length === 0 && (
          <EmptyState
            title="No Facility found"
            description="You haven't added any Facility yet."
            actionLabel="Add Facility "
            onAction={() => navigate("/add-facilities")}
          />
        )}
      </div>
    </div>
  );
};

export default FacilitiesList;