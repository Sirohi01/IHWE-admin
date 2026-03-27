import React, { useState } from 'react';
import {
  Search,
  Eye,
  Trash2,
  Edit,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import Table from '../components/table/Table';
import Pagination from '../components/Pagination';
import Swal from 'sweetalert2';

const BookAStand = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // STATIC MOCK DATA
  const mockData = [
    {
      _id: "1",
      exhibitorName: "TechHealth Innovations",
      mobile: "+971 50 123 4567",
      industrySector: "Medical Devices",
      company: "TechHealth LLC",
      country: "UAE",
      status: "Active",
      createdAt: "2026-03-10T10:30:00Z",
      invoiceNo: "INV-2026-001",
      amount: "AED 5,000",
      paymentStatus: "Paid"
    },
    {
      _id: "2",
      exhibitorName: "Global Pharma Corp",
      mobile: "+91 98765 43210",
      industrySector: "Pharmaceuticals",
      company: "GPC India",
      country: "India",
      status: "Inactive",
      createdAt: "2026-03-11T09:15:00Z",
      invoiceNo: "INV-2026-002",
      amount: "USD 1,500",
      paymentStatus: "Pending"
    },
    {
      _id: "3",
      exhibitorName: "NextGen Wellness",
      mobile: "+44 20 7123 4567",
      industrySector: "Wellness & Spa",
      company: "NextGen UK",
      country: "UK",
      status: "Active",
      createdAt: "2026-03-11T11:00:00Z",
      invoiceNo: "INV-2026-003",
      amount: "GBP 1,200",
      paymentStatus: "Paid"
    }
  ];

  const stats = [
    { label: "Total Applications", value: "156", icon: ClipboardList, color: "bg-blue-500" },
    { label: "Today's Applications", value: "12", icon: Clock, color: "bg-green-500" },
    { label: "Pending Reviews", value: "45", icon: TrendingUp, color: "bg-orange-500" },
    { label: "Active Exhibitors", value: "98", icon: Users, color: "bg-purple-500" },
  ];

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleEdit = (record) => {
    Swal.fire({
      title: 'Edit Registration',
      text: `Editing registration for ${record.exhibitorName}`,
      icon: 'info',
      confirmButtonColor: '#23471d'
    });
  };

  const handleDelete = (record) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Deleted!', 'Record has been deleted.', 'success');
      }
    });
  };

  const columns = [
    {
      key: "sno",
      label: "S.NO",
      width: "60px",
      render: (_, index) => (
        <div className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</div>
      )
    },
    {
      key: "exhibitorName",
      label: "EXHIBITOR NAME",
      render: (row) => <div className="font-semibold text-[#d26019]">{row.exhibitorName}</div>
    },
    {
      key: "mobile",
      label: "MOBILE NUMBER",
      render: (row) => <div className="text-gray-700">{row.mobile}</div>
    },
    {
      key: "industrySector",
      label: "INDUSTRY SECTOR",
      render: (row) => <div className="text-gray-700">{row.industrySector}</div>
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${
          row.status === "Active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
        }`}>
          {row.status === "Active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {row.status}
        </div>
      )
    },
    {
      key: "createdAt",
      label: "DATE",
      render: (row) => (
        <div className="text-gray-600 text-sm">
          {new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleView(row)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shadow-sm border border-blue-100" title="View Invoice">
            <Eye size={16} />
          </button>
          <button onClick={() => handleEdit(row)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors shadow-sm border border-amber-100" title="Edit">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(row)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors shadow-sm border border-red-100" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-inter">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#23471d] tracking-tight">BOOK A STAND</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage and review exhibitor registration applications</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800 mt-2 tracking-tighter">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
              <TrendingUp size={12} className="mr-1" />
              +12% this week
            </div>
          </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-[#23471d]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Users className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Exhibitor List</h2>
            </div>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#d26019] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by name, sector or country..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-transparent focus:border-[#d26019] focus:outline-none transition-all rounded-xl text-sm font-medium shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={mockData}
          />
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalItems={mockData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            label="registrations"
          />
        </div>
      </div>

      {/* VIEW MODAL (INVOICE) */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-[#23471d] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Printer size={24} />
                <h3 className="text-xl font-bold tracking-tight">Exhibitor Invoice Details</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              {/* Invoice Layout */}
              <div className="border border-slate-200 p-8 rounded-2xl bg-slate-50/50">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <img src="/logo.png" alt="Logo" className="h-16 mb-4 filter drop-shadow-sm" />
                    <p className="text-slate-500 text-sm font-bold uppercase">International Health & Wellness Expo 2026</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-3xl font-black text-[#23471d] mb-1">INVOICE</h4>
                    <p className="text-slate-500 font-bold tracking-widest">{selectedRecord.invoiceNo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill To:</p>
                    <p className="text-lg font-bold text-[#23471d]">{selectedRecord.exhibitorName}</p>
                    <p className="text-sm font-medium text-slate-600">{selectedRecord.company}</p>
                    <p className="text-sm font-medium text-slate-600">{selectedRecord.country}</p>
                    <p className="text-sm font-medium text-slate-600">{selectedRecord.mobile}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Details:</p>
                    <p className="text-sm font-medium text-slate-600"><span className="font-bold text-slate-800">Date:</span> {new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-slate-600"><span className="font-bold text-slate-800">Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        selectedRecord.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {selectedRecord.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>

                <table className="w-full mb-8 border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#23471d]">
                      <th className="text-left py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="text-right py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-4 text-sm font-bold text-slate-700">Exhibition Stand Booking - Standard Shell Space</td>
                      <td className="py-4 text-right text-sm font-bold text-slate-900">{selectedRecord.amount}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="py-6 text-right font-black text-slate-400 uppercase tracking-widest pr-8 font-inter">Total Amount</td>
                      <td className="py-6 text-right font-black text-2xl text-[#23471d] tracking-tighter font-inter">{selectedRecord.amount}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="bg-[#23471d]/5 p-4 rounded-xl border border-[#23471d]/10">
                  <p className="text-xs text-[#23471d]/80 font-bold leading-relaxed">
                    * This is a computer generated invoice. No signature is required. Please bring a copy of this invoice during the exhibition setup.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-6 flex justify-end gap-3 items-center">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors uppercase text-xs tracking-wider font-inter">
                <Download size={16} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-8 py-2.5 bg-[#d26019] text-white rounded-xl font-bold hover:bg-[#b35215] transition-all shadow-lg hover:shadow-[#d26019]/25 uppercase text-xs tracking-wider font-inter">
                <Printer size={16} />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAStand;
