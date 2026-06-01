import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, AlertCircle, RefreshCw, X } from "lucide-react";
import Swal from 'sweetalert2';
import api from "../lib/api";

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [passwordVisibility, setPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form when modal is opened/closed
    useEffect(() => {
        if (!isOpen) {
            handleResetForm();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        if ((name === "newPassword" || name === "confirmPassword") && formData.confirmPassword) {
            if (name === "newPassword" && formData.confirmPassword !== value && formData.confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
            } else if (name === "confirmPassword" && formData.newPassword !== value && formData.newPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
            } else if (formData.newPassword && value && formData.newPassword === value) {
                setErrors(prev => ({ ...prev, confirmPassword: null }));
            }
        }
    };

    const togglePasswordVisibility = (field) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = "Current password is required";
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        return newErrors;
    };

    const handleSubmit = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Get adminId from localStorage (checking both 'admin' and 'adminInfo')
            let adminId = null;

            try {
                // Check both localStorage and sessionStorage
                let adminData = localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo');
                if (!adminData) {
                    adminData = localStorage.getItem('admin') || sessionStorage.getItem('admin');
                }

                if (adminData) {
                    const parsedData = JSON.parse(adminData);
                    adminId = parsedData._id || parsedData.id;
                }
            } catch (e) {
                console.error('Error parsing admin data:', e);
            }

            if (!adminId) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Please login again to continue',
                    confirmButtonColor: '#134698'
                });
                setIsSubmitting(false);
                return;
            }

            const response = await api.put('/api/admin/change-password', {
                adminId: adminId,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Password changed successfully',
                    confirmButtonColor: '#134698',
                    timer: 2000
                });

                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setErrors({});
                onClose();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to change password',
                confirmButtonColor: '#134698'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    function handleResetForm() {
        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setErrors({});
        setPasswordVisibility({
            current: false,
            new: false,
            confirm: false
        });
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 tracking-tight uppercase">Change Password</h2>
                        <p className="text-xs text-gray-500 mt-1">Update your account password to keep it secure</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="space-y-5">
                        {/* Current Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Current Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisibility.current ? "text" : "password"}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter current password"
                                    className={`w-full px-3 py-2.5 border ${errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-sm focus:outline-none focus:border-[#005461] transition-colors text-sm`}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("current")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {passwordVisibility.current ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {errors.currentPassword}
                                </p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisibility.new ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                    className={`w-full px-3 py-2.5 border ${errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-sm focus:outline-none focus:border-[#005461] transition-colors text-sm`}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("new")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {passwordVisibility.new ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {errors.newPassword}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Confirm New Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisibility.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm new password"
                                    className={`w-full px-3 py-2.5 border ${errors.confirmPassword ? 'border-red-300 bg-red-50' :
                                            formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'border-green-300 bg-green-50' :
                                                'border-gray-300'
                                        } rounded-sm focus:outline-none focus:border-[#005461] transition-colors text-sm`}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirm")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {passwordVisibility.confirm ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={handleResetForm}
                        className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-sm transition-colors flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-6 py-2 text-xs font-bold text-white rounded-sm transition-all shadow-sm flex items-center gap-1.5 uppercase tracking-wider ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#005461] hover:bg-[#00424c]'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Updating...
                            </>
                        ) : (
                            <>
                                <Shield className="w-3.5 h-3.5" />
                                Change Password
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
