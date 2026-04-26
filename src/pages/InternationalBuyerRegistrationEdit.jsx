import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';

const InternationalBuyerRegistrationEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/api/international-buyer/${id}`);
                if (response.data.success) {
                    setFormData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching registration:', error);
                Swal.fire('Error', 'Failed to load registration data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMultiChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Backend PUT /api/international-buyer/:id update logic
            const response = await api.put(`/api/international-buyer/${id}`, formData);
            if (response.data.success) {
                await Swal.fire('Success', 'Registration updated successfully', 'success');
                navigate(`/international-buyer/${id}`);
            }
        } catch (error) {
            console.error('Error updating registration:', error);
            Swal.fire('Error', 'Failed to update registration', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!formData) return null;

    const inputClasses = "w-full px-4 py-2 border-2 border-gray-200 focus:border-gray-800 focus:outline-none transition-colors text-sm rounded-sm font-medium bg-white";
    const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
    const SectionTitle = ({ title }) => <h3 className="text-sm font-bold text-gray-800 uppercase tracking-[0.2em] border-b pb-2 mb-6 mt-10">{title}</h3>;

    const Button = ({ children, onClick, className, variant, disabled, type, ...props }) => {
        const baseStyles = "px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-200 rounded-sm flex items-center gap-2";
        const variants = { primary: "bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-400", outline: "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm" };
        return <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyles} ${variant === 'outline' ? variants.outline : variants.primary} ${className}`} {...props}>{children}</button>;
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 pb-20">
            <div className="w-full">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <button onClick={() => navigate(`/international-buyer/${id}`)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-2 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Details
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-tight italic">Edit <span className="text-slate-900">International Registration</span></h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-100 p-8 shadow-lg rounded-none">
                    {/* Admin Status Section */}
                    <div className="bg-slate-50 p-6 border-l-4 border-orange-500 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelClasses}>Approval Status</label>
                            <select 
                                name="verification.adminApprovalStatus" 
                                value={formData.verification?.adminApprovalStatus || "Pending"} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        verification: { ...prev.verification, adminApprovalStatus: val }
                                    }));
                                }} 
                                className={inputClasses}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Payment Status</label>
                            <select 
                                name="paymentStatus" 
                                value={formData.paymentStatus || "Pending"} 
                                onChange={handleChange} 
                                className={inputClasses}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Registration ID</label>
                            <input name="registrationId" value={formData.registrationId || ""} readOnly className={`${inputClasses} bg-gray-50 cursor-not-allowed`} />
                        </div>
                        <div className="md:col-span-3">
                            <label className={labelClasses}>Internal Remarks</label>
                            <textarea name="remarks" value={formData.remarks || ""} onChange={handleChange} rows={2} className={`${inputClasses} resize-none`} placeholder="Add internal notes about this buyer..." />
                        </div>
                    </div>

                    <SectionTitle title="1. Company Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div><label className={labelClasses}>Brand Name</label><input required name="brandName" value={formData.brandName || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Legal Entity Type</label><input name="legalEntityType" value={formData.legalEntityType || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Country of Registration</label><input required name="countryOfRegistration" value={formData.countryOfRegistration || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Year Established</label><input name="yearOfEstablishment" value={formData.yearOfEstablishment || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Tax Reg. Number</label><input name="taxRegistrationNumber" value={formData.taxRegistrationNumber || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Website</label><input name="website" value={formData.website || ""} onChange={handleChange} className={inputClasses} /></div>
                    </div>

                    <SectionTitle title="2. Primary Contact Person" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div><label className={labelClasses}>Full Name</label><input required name="primaryContact.fullName" value={formData.primaryContact?.fullName || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Designation</label><input name="primaryContact.designation" value={formData.primaryContact?.designation || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Email Address</label><input required name="primaryContact.emailId" value={formData.primaryContact?.emailId || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Mobile Number</label><input required name="primaryContact.mobileNumber" value={formData.primaryContact?.mobileNumber || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>WhatsApp Number</label><input name="primaryContact.whatsappNumber" value={formData.primaryContact?.whatsappNumber || ""} onChange={handleChange} className={inputClasses} /></div>
                    </div>

                    <SectionTitle title="3. Office Details" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-4"><label className={labelClasses}>Address</label><textarea required name="address" value={formData.address || ""} onChange={handleChange} rows={2} className={inputClasses} /></div>
                        <div><label className={labelClasses}>City</label><input required name="city" value={formData.city || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>State/Province</label><input name="stateProvince" value={formData.stateProvince || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Country</label><input required name="country" value={formData.country || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Postal Code</label><input name="postalCode" value={formData.postalCode || ""} onChange={handleChange} className={inputClasses} /></div>
                    </div>

                    <SectionTitle title="4. Product & Business Profile" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Nature of Business (Comma separated)</label>
                            <input 
                                name="natureOfBusiness" 
                                value={(formData.natureOfBusiness || []).join(', ')} 
                                onChange={(e) => handleMultiChange('natureOfBusiness', e.target.value)} 
                                className={inputClasses} 
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Product Categories (Comma separated)</label>
                            <input 
                                name="productCategories" 
                                value={(formData.productCategories || []).join(', ')} 
                                onChange={(e) => handleMultiChange('productCategories', e.target.value)} 
                                className={inputClasses} 
                            />
                        </div>
                    </div>

                    <div className="pt-10 flex justify-end gap-4 mt-10">
                        <Button type="button" variant="outline" onClick={() => navigate(`/international-buyer/${id}`)}>Cancel</Button>
                        <Button disabled={isSubmitting} type="submit" className="px-10">
                            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InternationalBuyerRegistrationEdit;
