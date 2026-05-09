import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, Building2, User, Phone, Eye, Calendar, Award } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';
import Table from '../components/table/Table';
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toastMessage";

const MsmePmsSchemeList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/msme-pms-scheme/all');
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      Swal.fire('Error', 'Failed to load applications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatusId(id);
      const response = await api.patch(`/api/msme-pms-scheme/${id}/status`, { status: newStatus });
      if (response.data.success) {
        showSuccess('Status updated successfully');
        fetchApplications();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (app) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/msme-pms-scheme/${app._id}`);
        if (response.data.success) {
          Swal.fire('Deleted!', 'Application has been deleted.', 'success');
          fetchApplications();
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete application', 'error');
      }
    }
  };

  const filteredApplications = applications.filter(app =>
    app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.emailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.udyamNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    {
      key: "sno",
      label: "S.NO",
      width: "80px",
      render: (_, index) => (
        <div className="font-bold text-gray-900">{startIndex + index + 1}</div>
      )
    },
    {
      key: "companyName",
      label: "COMPANY NAME",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#d26019]" />
          <div
            className="font-medium text-red-600 hover:underline cursor-pointer"
            onClick={() => navigate(`/msme-pms-scheme/${row._id}`)}
          >
            {row.companyName}
          </div>
        </div>
      )
    },
    {
      key: "contact",
      label: "CONTACT INFO",
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
            <User className="w-3.5 h-3.5 text-[#23471d]" />
            <span>{row.contactPerson}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Mail className="w-3 h-3 text-slate-400" />
            <span className="text-gray-600 font-normal italic">{row.emailId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Phone className="w-3 h-3 text-slate-400" />
            <span className="text-gray-600 font-normal italic">{row.mobileNumber}</span>
          </div>
        </div>
      )
    },
    {
      key: "udyamNumber",
      label: "UDYAM / GST",
      render: (row) => (
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-gray-900">Udyam: <span className="font-normal text-slate-600">{row.udyamNumber}</span></div>
          <div className="font-semibold text-gray-900">GST: <span className="font-normal text-slate-600">{row.gstNumber || 'N/A'}</span></div>
        </div>
      )
    },
    {
      key: "category",
      label: "CATEGORY",
      render: (row) => (
        <div className="text-xs uppercase font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded w-fit">
          {row.category}
        </div>
      )
    },
    // {
    //   key: "status",
    //   label: "STATUS",
    //   render: (row) => (
    //     <div className="relative inline-block">
    //       <select
    //         value={row.status}
    //         onChange={(e) => handleStatusChange(row._id, e.target.value)}
    //         disabled={updatingStatusId === row._id}
    //         className={`px-3 py-1 text-xs font-semibold rounded border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-8 ${row.status === 'Approved' ? 'bg-green-100 text-green-800' :
    //           row.status === 'Rejected' ? 'bg-red-100 text-red-800' :
    //             'bg-yellow-100 text-yellow-800'
    //           }`}
    //       >
    //         <option value="Pending">Pending</option>
    //         <option value="Approved">Approved</option>
    //         <option value="Rejected">Rejected</option>
    //       </select>
    //     </div>
    //   )
    // },
    {
      key: "date",
      label: "DATE",
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-900">
          <Calendar className="w-4 h-4 text-[#23471d]" />
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: "view",
      label: "VIEW",
      render: (row) => (
        <button
          onClick={() => navigate(`/msme-pms-scheme/${row._id}`)}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="bg-white shadow-md mt-6 p-6">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#23471d]">MSME PMS SCHEME</h1>
          <p className="text-gray-600 mt-2 text-lg">List of all MSME PMS Scheme applications submitted from the website</p>
        </div>

        <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b bg-[#23471d]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white uppercase">Application List</h2>
                <p className="text-sm text-blue-100 mt-0.5 normal-case tracking-normal">
                  Showing {filteredApplications.length} of {applications.length} applications
                </p>
              </div>

              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg bg-white normal-case font-normal"
                />
              </div>
            </div>
          </div>

          <div className="bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Table
                columns={columns}
                data={paginatedApplications}
              // onDelete={handleDelete}
              />
            )}
          </div>

          <div className="mt-4 px-4 pb-4 bg-white">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredApplications.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              label="applications"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsmePmsSchemeList;
