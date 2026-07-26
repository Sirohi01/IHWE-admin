import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, AlertCircle, RefreshCw, X, Send } from "lucide-react";
import Swal from 'sweetalert2';
import api from "../lib/api";

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [passwordVisibility, setPasswordVisibility] = useState({
        new: false,
        confirm: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [errors, setErrors] = useState({});
    const [adminId, setAdminId] = useState(null);

    // Reset form when modal is opened/closed
    useEffect(() => {
        if (!isOpen) {
            handleResetForm();
        } else {
            try {
                let adminData = localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo');
                if (!adminData) adminData = localStorage.getItem('admin') || sessionStorage.getItem('admin');
                if (adminData) {
                    const parsedData = JSON.parse(adminData);
                    setAdminId(parsedData._id || parsedData.id);
                }
            } catch (e) {
                console.error('Error parsing admin data:', e);
            }
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

    const handleSendOtp = async () => {
        if (!adminId) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Admin ID not found. Please re-login.', confirmButtonColor: '#134698' });
            return;
        }
        setIsSendingOtp(true);
        try {
            const res = await api.post('/api/admin/change-password-send-otp', { adminId });
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'OTP Sent', text: res.data.message, confirmButtonColor: '#134698', timer: 2000 });
                setStep(2);
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Failed to send OTP', confirmButtonColor: '#134698' });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.otp.trim()) {
            newErrors.otp = "OTP is required";
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

        if (!adminId) {
            await Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Please login again to continue', confirmButtonColor: '#134698' });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.put('/api/admin/change-password-verify-otp', {
                adminId: adminId,
                otp: formData.otp,
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

                handleResetForm();
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
        setStep(1);
        setFormData({
            otp: "",
            newPassword: "",
            confirmPassword: ""
        });
        setErrors({});
        setPasswordVisibility({
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
                    {step === 1 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                <Shield className="w-8 h-8 text-[#005461]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Secure Password Reset</h3>
                            <p className="text-sm text-gray-500 max-w-sm">
                                To ensure your account security, we will send a One Time Password (OTP) to your registered WhatsApp number.
                            </p>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className={`mt-4 px-6 py-2.5 text-sm font-bold text-white rounded-sm transition-all shadow-sm flex items-center gap-2 uppercase tracking-wider ${isSendingOtp
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#005461] hover:bg-[#00424c]'
                                    }`}
                            >
                                {isSendingOtp ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send OTP via WhatsApp
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* OTP */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    WhatsApp OTP <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleInputChange}
                                        placeholder="Enter 4-digit OTP"
                                        maxLength="4"
                                        className={`w-full px-3 py-2.5 border ${errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-sm focus:outline-none focus:border-[#005461] transition-colors text-sm`}
                                    />
                                </div>
                                {errors.otp && (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {errors.otp}
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
                    )}
                </div>

                {step === 2 && (
                    <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleResetForm}
                            className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-sm transition-colors flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Cancel
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
                )}
            </div>
        </div>
    );
};

export default ChangePasswordModal;
