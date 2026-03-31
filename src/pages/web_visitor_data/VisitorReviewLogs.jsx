import React, { useState, useEffect } from "react";
import Table from "../../components/table/Table";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import api from "../../lib/api";
import { toast } from "react-toastify";
import { Search, Calendar, RefreshCw } from "lucide-react";

const VisitorReviewLogs = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchReviews();
  }, [searchTerm]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/visitor-reviews?search=${searchTerm}`
      );
      if (response.data.data) {
        setReviews(response.data.data);
      } else if (Array.isArray(response.data)) {
        setReviews(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch visitor review logs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      const response = await api.delete(`/api/visitor-reviews/${id}`);
      if (response.data.success) {
        toast.success("Review log deleted");
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to delete review log");
    }
  };

  const columns = [
    {
      label: "S.NO",
      key: "sno",
      render: (row, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      label: "Visitor ID",
      key: "visitor_id",
      render: (row) => (
        <div className="font-medium text-blue-600">{row.visitor_id || "N/A"}</div>
      ),
    },
    {
      label: "Status",
      key: "visitor_status",
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {row.visitor_status}
        </span>
      ),
    },
    {
      label: "Event ID",
      key: "visitor_event",
      render: (row) => <div className="text-xs truncate w-24" title={row.visitor_event}>{row.visitor_event}</div>,
    },
    {
      label: "Description/Message",
      key: "visitor_desc",
      render: (row) => <div className="max-w-xs truncate" title={row.visitor_desc}>{row.visitor_desc}</div>,
    },
    {
      label: "Added By",
      key: "added_by",
    },
    {
      label: "Date",
      key: "added",
      render: (row) => row.added ? new Date(row.added).toLocaleDateString() : "N/A",
    },
  ];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="VISITOR REVIEW LOGS"
        description={`Total: ${reviews.length} logs`}
      />

      <div className="flex gap-4 my-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchReviews}
          className="px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedReviews}
            onDelete={(row) => handleDelete(row._id)}
          />
        )}
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalItems={reviews.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default VisitorReviewLogs;
