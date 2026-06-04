import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../lib/api";
import {
    Plus, Trash2, Edit, Save, Building, CheckCircle, XCircle
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const EMPTY_FORM = {
    bankname: '',
    accountname: '',
    accountno: '',
    ifsccode: '',
    bankbranch: '',
    status: 'active'
};

const BankDetailsManage = () => {
    const [banks, setBanks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/banks');
            if (response.data) {
                setBanks(response.data);
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        if (!formData.bankname || !formData.accountname || !formData.accountno || !formData.ifsccode || !formData.bankbranch) {
            Swal.fire('Warning', 'All fields are required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            const payload = { ...formData };
            
            let response;
            if (editingId) {
                response = await api.put(`/api/banks/${editingId}`, payload);
            } else {
                response = await api.post('/api/banks', payload);
            }
            
            if (response.status === 200 || response.status === 201) {
                Swal.fire({ icon: 'success', title: editingId ? 'Bank Detail Updated!' : 'Bank Detail Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save bank detail', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Bank Detail?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/banks/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (bank) => {
        setFormData({
            bankname: bank.bankname || '',
            accountname: bank.accountname || '',
            accountno: bank.accountno || '',
            ifsccode: bank.ifsccode || '',
            bankbranch: bank.bankbranch || '',
            status: bank.status || 'active'
        });
        setEditingId(bank._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ ...EMPTY_FORM });
        setEditingId(null);
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="BANK DETAILS"
                description="Manage bank account details for Exhibitor Invoices"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {editingId ? 'Edit Bank Detail' : 'Add Bank Detail'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Bank Name</label>
                                <input
                                    type="text"
                                    name="bankname"
                                    value={formData.bankname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="e.g. Kotak Mahindra Bank"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Account Name</label>
                                <input
                                    type="text"
                                    name="accountname"
                                    value={formData.accountname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="e.g. Namo Gange Wellness Pvt. Ltd."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Account No.</label>
                                <input
                                    type="text"
                                    name="accountno"
                                    value={formData.accountno}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="e.g. 6812013962"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">IFSC Code</label>
                                <input
                                    type="text"
                                    name="ifsccode"
                                    value={formData.ifsccode}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="e.g. KKBK0004584"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Branch Name</label>
                                <input
                                    type="text"
                                    name="bankbranch"
                                    value={formData.bankbranch}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                    placeholder="e.g. Jagriti Enclave, Delhi"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : <>{editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingId ? 'Update Bank' : 'Add Bank'}</>}
                                </button>
                                {(editingId || formData.bankname) && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Building className="w-4 h-4" /> Bank Details List
                            </h2>
                            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {banks.length} BANKS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100/50 border-b-2 border-gray-200">
                                        <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Bank Name</th>
                                        <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Account details</th>
                                        <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">Status</th>
                                        <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banks.map((bank, index) => (
                                        <tr key={bank._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-3 align-top">
                                                <div className="font-bold text-gray-800 text-xs">{bank.bankname}</div>
                                                <div className="text-[10px] text-gray-500 mt-1">{bank.bankbranch}</div>
                                            </td>
                                            <td className="p-3 align-top">
                                                <div className="font-bold text-gray-800 text-xs">{bank.accountname}</div>
                                                <div className="text-[10px] text-gray-500 mt-1">A/C: {bank.accountno}</div>
                                                <div className="text-[10px] text-gray-500">IFSC: {bank.ifsccode}</div>
                                            </td>
                                            <td className="p-3 align-top text-center">
                                                {bank.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        <XCircle className="w-3 h-3" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 align-top">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(bank)}
                                                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bank._id)}
                                                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {banks.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                                No bank details found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankDetailsManage;
