import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import Pagination from "../components/Pagination";
import Table from '../components/table/Table';

const AdminUser = () => {
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState([]);


  useEffect(() => {
    const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (info) {
      setCurrentUser(JSON.parse(info));
    }
  }, []);

  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "",
    mobile: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/roles');
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };


  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/all');

      if (response.data.success) {
        setAdmins(response.data.data);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch admins',
        confirmButtonColor: '#134698'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({
      ...newAdmin,
      [name]: value
    });
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Field',
        text: 'Please enter a username',
        confirmButtonColor: '#134698'
      });
      return;
    }

    if (!newAdmin.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Field',
        text: 'Please enter a password',
        confirmButtonColor: '#134698'
      });
      return;
    }

    if (!newAdmin.role) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Field',
        text: 'Please select a role',
        confirmButtonColor: '#134698'
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/api/admin/create', {
        username: newAdmin.username,
        password: newAdmin.password,
        role: newAdmin.role,
        mobile: newAdmin.mobile
      });

      if (response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User created successfully',
          confirmButtonColor: '#134698',
          timer: 2000
        });

        setNewAdmin({
          username: "",
          password: "",
          role: "",
          mobile: ""
        });

        fetchAdmins();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create user',
        confirmButtonColor: '#134698'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdmin = async (admin) => {
    const isSuper = currentUser?.role === 'super-admin';
    const canChangeRole = isSuper;

    const { value: formValues } = await Swal.fire({
      title: 'Edit User',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input id="swal-username" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#134698] focus:outline-none" value="${admin.username}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select id="swal-role" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#134698] focus:outline-none" ${!canChangeRole ? 'disabled' : ''}>
              ${roles.map(r => `
                <option value="${r.name}" ${admin.role === r.name ? 'selected' : ''}>${r.name}</option>
              `).join('')}
            </select>

          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select id="swal-status" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#134698] focus:outline-none">
              <option value="Active" ${admin.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${admin.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
            <input id="swal-mobile" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#134698] focus:outline-none" value="${admin.mobile || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Password (optional)</label>
            <input id="swal-password" type="password" class="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#134698] focus:outline-none" placeholder="Leave blank to keep current">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update User',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#134698',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'rounded-sm',
        confirmButton: 'px-6 py-3 font-semibold',
        cancelButton: 'px-6 py-3 font-semibold'
      },
      preConfirm: () => {
        return {
          username: document.getElementById('swal-username').value,
          role: document.getElementById('swal-role').value,
          status: document.getElementById('swal-status').value,
          mobile: document.getElementById('swal-mobile').value,
          password: document.getElementById('swal-password').value
        };
      }
    });

    if (formValues) {
      try {
        setIsLoading(true);
        const updateData = {
          username: formValues.username,
          role: formValues.role,
          status: formValues.status
        };

        if (formValues.password) {
          updateData.password = formValues.password;
        }

        const response = await api.put(`/api/admin/update/${admin._id}`, updateData);

        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Admin updated successfully',
            confirmButtonColor: '#134698',
            timer: 2000
          });
          fetchAdmins();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to update admin',
          confirmButtonColor: '#134698'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteAdmin = async (admin) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `Do you want to delete <strong>${admin.username}</strong>?<br><span class="text-red-600">This action cannot be undone!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-sm',
        confirmButton: 'px-6 py-3 font-semibold',
        cancelButton: 'px-6 py-3 font-semibold'
      }
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const response = await api.delete(`/api/admin/delete/${admin._id}`);

        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Admin has been deleted successfully',
            confirmButtonColor: '#134698',
            timer: 2000
          });
          fetchAdmins();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete admin',
          confirmButtonColor: '#134698'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch =
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const columns = [
    {
      key: "sno",
      label: "S.NO",
      width: "80px",
      render: (row, index) => (
        <div className="font-bold text-gray-900">
          {startIndex + index + 1}
        </div>
      )
    },

    {
      key: "username",
      label: "USERNAME",
      render: (row) => (
        <div className="font-medium text-red-600">{row.username}</div>
      )
    },
    {
      key: "role",
      label: "ROLE",
      render: (row) => (
        <div className="text-gray-900 font-medium capitalize">{row.role ? row.role.replace(/-/g, ' ') : 'N/A'}</div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${row.status === "Active"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}>
            {row.status === "Active" ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {row.status}
          </div>
        </div>
      )
    },
    {
      key: "createdAt",
      label: "CREATED AT",
      render: (row) => (
        <div className="text-gray-900">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: "lastLogin",
      label: "LAST LOGIN",
      render: (row) => (
        <div className="text-sm text-gray-900">
          {row.lastLogin ? new Date(row.lastLogin).toLocaleString() : 'Never'}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white shadow-md mt-6 p-6">
      <div className="w-full">
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#23471d]">MANAGE USERS</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage admin users and their permissions</p>
          </div>

          <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <UserPlus className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create New Admin</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={newAdmin.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={newAdmin.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm bg-white"
                >
                  <option value="">Select Role</option>
                  {roles.map(r => (
                    <option key={r._id} value={r.name}>{r.name}</option>
                  ))}
                </select>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={newAdmin.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile"
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm"
                />
              </div>

              <button
                onClick={handleCreateAdmin}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-[#d26019] text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create User</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b bg-[#23471d]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Admin List
                  </h2>
                  <p className="text-sm text-blue-100 mt-0.5">
                    Showing {filteredAdmins.length} of {admins.length} admins
                  </p>
                </div>

                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Table
                  columns={columns}
                  data={paginatedAdmins}
                  onEdit={handleEditAdmin}
                  onDelete={handleDeleteAdmin}
                />
              )}
            </div>

            <div className="mt-4 px-4 pb-4 bg-white">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredAdmins.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                label="admins"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUser;