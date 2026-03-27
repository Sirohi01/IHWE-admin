import { useState } from "react";
import { Eye, EyeOff, Shield, AlertCircle, RefreshCw } from "lucide-react";
import Swal from 'sweetalert2';
import api from "../lib/api";
import PageHeader from "../components/PageHeader";


const ChangePassword = () => {
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

    const handleResetForm = () => {
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
    };

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <div className="w-full">
                <PageHeader
                    title="CHANGE PASSWORD"
                    description="Update your account password to keep it secure"
                />

                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={passwordVisibility.current ? "text" : "password"}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        placeholder="Enter current password"
                                        className={`w-full px-4 py-3 border-2 ${errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("current")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {passwordVisibility.current ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.currentPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.currentPassword}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={passwordVisibility.new ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder="Enter new password"
                                        className={`w-full px-4 py-3 border-2 ${errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("new")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {passwordVisibility.new ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.newPassword}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={passwordVisibility.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm new password"
                                        className={`w-full px-4 py-3 border-2 ${errors.confirmPassword ? 'border-red-300 bg-red-50' :
                                                formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'border-green-300 bg-green-50' :
                                                    'border-gray-300'
                                            } focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("confirm")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {passwordVisibility.confirm ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="px-6 py-3 text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 focus:outline-none transition-colors flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    RESET FORM
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`flex-1 px-6 py-3 text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase tracking-wider ${isSubmitting
                                            ? 'bg-[#DE802B] opacity-50 cursor-not-allowed'
                                            : 'bg-[#005461]'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            UPDATING...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4" />
                                            CHANGE PASSWORD
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Required Note */}
                            <div className="text-center pt-2">
                                <p className="text-xs text-gray-500">
                                    All fields are required
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;