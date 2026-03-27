import { useState, useEffect } from "react";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import api, { API_URL, SERVER_URL } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import { Plus } from "lucide-react";


import { SearchBar } from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import Table from "../../components/table/Table";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/client");

      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch clients",
        confirmButtonColor: "#134698",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (client) => {
    localStorage.setItem("editClient", JSON.stringify(client));
    window.location.href = "/add-clients";
  };

  const handleDelete = async (client) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `Do you want to delete <strong>${client.name}</strong>?<br><span class="text-red-600">This action cannot be undone!</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const response = await api.delete(`/api/client/delete/${client._id}`);

        if (response.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Client has been deleted successfully",
            confirmButtonColor: "#134698",
            timer: 2000,
          });
          fetchClients();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete client",
          confirmButtonColor: "#134698",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one client to delete",
        confirmButtonColor: "#134698",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete",
      html: `Are you sure you want to delete <strong>${selectedRows.length}</strong> clients?<br><span class="text-red-600">This action cannot be undone!</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const response = await api.post("/api/client/bulk-delete", {
          ids: selectedRows,
        });

        if (response.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `${selectedRows.length} clients deleted successfully`,
            confirmButtonColor: "#134698",
            timer: 2000,
          });
          setSelectedRows([]);
          fetchClients();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete clients",
          confirmButtonColor: "#134698",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredClients = clients.filter((client) => {
    const name = client.name || "";
    const url = client.url || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + rowsPerPage
  );


  const columns = [
    {
      key: "sno",
      label: "S.NO",
      render: (_, index) => startIndex + index + 1,
    },
    {
      key: "image",
      label: "LOGO",
      render: (row) => (
        <div className="w-28 h-14 bg-white border border-gray-200 flex items-center justify-center rounded">
          <img
            src={`${SERVER_URL}${row.image}`}
            alt={row.name}
            className="max-h-12 max-w-[90px] object-contain"
          />
        </div>
      ),
    },
    {
      key: "name",
      label: "CLIENT NAME",
    },
    {
      key: "url",
      label: "URL",
      render: (row) => (
        <a
          href={row.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {(row.url || "").slice(0, 45)}
          {(row.url || "").length > 45 ? "..." : ""}
        </a>
      ),
    },
    {
      key: "showOnHomepage",
      label: "HOMEPAGE",
      render: (row) =>
        row.showOnHomepage ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
            <XCircle className="w-3 h-3" />
            No
          </span>
        ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${row.status === "Active"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {row.status === "Active" ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {row.status}
        </span>
      ),
    },
  ];


  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      {/* HEADER */}
      <PageHeader
        title="CLIENT LISTS"
        description="Manage and view all clients in your system"
        buttonText="Add Client"
        buttonIcon={Plus}
        buttonPath="/add-clients"
      />

      {/* SEARCH BAR */}
      <div className="bg-white border-2 border-gray-200 shadow-lg">
        <div className="p-4">
          <SearchBar
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setCurrentPage(1);
            }}
            searchValue={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search by client name or URL..."
          />
        </div>

        {/* BULK DELETE BUTTON */}
        {selectedRows.length > 0 && (
          <div className="px-4 pb-4 flex justify-end">
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white font-semibold shadow hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedRows.length})
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={paginatedClients}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* PAGINATION */}
        <div className="mt-4 px-4 pb-4 bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredClients.length}
            itemsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            label="clients"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientList;
