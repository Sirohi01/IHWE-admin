import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, FileText, IndianRupee,
    Info, Loader2, Paperclip, Save, Send, UploadCloud, WalletCards,
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const today = new Date().toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

const inputClass = 'w-full min-h-10 px-3 py-2.5 border border-slate-300 rounded-md bg-white text-sm font-normal text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500';
const labelClass = 'block text-xs font-medium text-slate-700 mb-1.5';

const CreateImprestRequest = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [form, setForm] = useState({
        requestType: 'Advance Request',
        purpose: '',
        department: '',
        employeeName: '',
        employeeId: '',
        designation: '',
        requestDate: today,
        requiredByDate: nextWeek,
        currency: 'INR',
        detailedPurpose: '',
        requestedAmount: '',
        expenseHead: '',
        remarks: '',
    });

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const response = await api.get('/api/admin/all');
                const rows = response.data?.data || [];
                setEmployees(rows.filter((item) => !item.status || item.status === 'Active'));
            } catch {
                toast.error('Failed to load employees');
            } finally {
                setLoadingEmployees(false);
            }
        };
        loadEmployees();
    }, []);

    const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const selectEmployee = (employeeKey) => {
        const employee = employees.find((item) => String(item._id) === String(employeeKey));
        if (!employee) {
            setForm((current) => ({
                ...current,
                employeeName: '',
                employeeId: '',
                designation: '',
                department: '',
            }));
            return;
        }
        setForm((current) => ({
            ...current,
            employeeName: employee.fullName || employee.username || '',
            employeeId: employee.username || String(employee._id),
            designation: employee.designation || '',
            department: employee.department || '',
        }));
    };

    const validate = (asDraft) => {
        if (asDraft) return true;
        const required = [
            ['requestType', 'Request type'],
            ['purpose', 'Purpose'],
            ['department', 'Department'],
            ['employeeName', 'Employee name'],
            ['employeeId', 'Employee ID'],
            ['requestDate', 'Request date'],
            ['requiredByDate', 'Required by date'],
            ['detailedPurpose', 'Detailed purpose'],
            ['requestedAmount', 'Requested amount'],
            ['expenseHead', 'Expense head'],
        ];
        const missing = required.find(([field]) => !String(form[field] || '').trim());
        if (missing) {
            toast.error(`${missing[1]} is required`);
            return false;
        }
        if (Number(form.requestedAmount) <= 0) {
            toast.error('Requested amount must be greater than zero');
            return false;
        }
        if (new Date(form.requiredByDate) < new Date(form.requestDate)) {
            toast.error('Required by date cannot be before request date');
            return false;
        }
        return true;
    };

    const submit = async (asDraft = false) => {
        if (!validate(asDraft)) return;
        setSubmitting(true);
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => payload.append(key, value));
            payload.append('status', asDraft ? 'Draft' : 'Pending Approval');
            if (attachment) payload.append('attachment', attachment);
            const response = await api.post('/api/imprest', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (asDraft) {
                toast.success(response.data?.message || 'Imprest request saved as draft');
            } else {
                await Swal.fire({
                    icon: 'success',
                    title: 'Request Submitted',
                    html: `
                        <div style="font-size:13px;color:#475569">
                            Your imprest request has been submitted successfully.
                        </div>
                        <div style="margin-top:12px;padding:10px;background:#eff6ff;border-radius:6px;font-size:14px;font-weight:700;color:#2563eb">
                            ${response.data?.data?.requestNo || ''}
                        </div>
                    `,
                    confirmButtonText: 'View Requests',
                    confirmButtonColor: '#2563eb',
                    allowOutsideClick: false,
                });
            }
            navigate('/accounts/imprest');
        } catch (error) {
            if (asDraft) {
                toast.error(error.response?.data?.message || 'Failed to save imprest request');
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: error.response?.data?.message || 'Failed to submit imprest request',
                    confirmButtonColor: '#2563eb',
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/accounts/imprest')} className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600"><ArrowLeft className="w-4 h-4" /></button>
                        <h1 className="text-2xl font-medium text-slate-900 tracking-tight">New Imprest (Petty Cash) Request</h1>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-10 text-xs text-slate-500 font-medium">
                        <span>Accounts</span><ChevronRight className="w-3 h-3" /><span>Imprest</span><ChevronRight className="w-3 h-3" /><span className="text-blue-600 font-medium">New Request</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium">
                    <CalendarDays className="w-4 h-4 text-slate-500" /> {form.requestDate}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-2">
                <main className="w-full lg:w-[78%] bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <section>
                        <h2 className="flex items-center gap-2 text-base font-medium text-slate-800 pb-3 border-b border-slate-100">
                            <FileText className="w-4 h-4 text-blue-600" /> Request Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <label><span className={labelClass}>Request Type *</span><select value={form.requestType} onChange={(e) => update('requestType', e.target.value)} className={inputClass}><option>Advance Request</option><option>Expense Claim</option><option>Reimbursement</option></select></label>
                            <label><span className={labelClass}>Purpose / Description *</span><input value={form.purpose} onChange={(e) => update('purpose', e.target.value)} placeholder="Enter purpose of the request" className={inputClass} /></label>
                            <label>
                                <span className={labelClass}>Employee Name *</span>
                                <select
                                    value={employees.find((item) => (item.fullName || item.username) === form.employeeName)?._id || ''}
                                    onChange={(e) => selectEmployee(e.target.value)}
                                    disabled={loadingEmployees}
                                    className={`${inputClass} disabled:bg-slate-100`}
                                >
                                    <option value="">{loadingEmployees ? 'Loading Employees...' : 'Select Employee'}</option>
                                    {employees.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.fullName || item.username}{item.username ? ` (${item.username})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label><span className={labelClass}>Employee ID *</span><input value={form.employeeId} readOnly placeholder="Auto-filled Employee ID" className={`${inputClass} bg-slate-50`} /></label>
                            <label><span className={labelClass}>Designation</span><input value={form.designation} readOnly placeholder="Auto-filled Designation" className={`${inputClass} bg-slate-50`} /></label>
                            <label><span className={labelClass}>Department *</span><input value={form.department} readOnly placeholder="Auto-filled Department" className={`${inputClass} bg-slate-50`} /></label>
                            <label><span className={labelClass}>Date of Request *</span><input type="date" value={form.requestDate} onChange={(e) => update('requestDate', e.target.value)} className={inputClass} /></label>
                            <label><span className={labelClass}>Required By Date *</span><input type="date" min={form.requestDate} value={form.requiredByDate} onChange={(e) => update('requiredByDate', e.target.value)} className={inputClass} /></label>
                            <label><span className={labelClass}>Currency *</span><select value={form.currency} onChange={(e) => update('currency', e.target.value)} className={inputClass}><option value="INR">INR - Indian Rupee (₹)</option></select></label>
                        </div>
                        <label className="block mt-4"><span className={labelClass}>Detailed Purpose / Justification *</span><textarea value={form.detailedPurpose} maxLength={500} onChange={(e) => update('detailedPurpose', e.target.value)} placeholder="Please provide detailed justification for the imprest amount request..." className={`${inputClass} min-h-24 resize-y`} /><span className="block text-right text-[10px] text-slate-400 mt-1">{form.detailedPurpose.length} / 500</span></label>
                    </section>

                    <section className="mt-5">
                        <h2 className="flex items-center gap-2 text-base font-medium text-slate-800 pb-3 border-b border-slate-100">
                            <WalletCards className="w-4 h-4 text-blue-600" /> Amount Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <label><span className={labelClass}>Requested Amount (₹) *</span><div className="relative"><input type="number" min="0" step="0.01" value={form.requestedAmount} onChange={(e) => update('requestedAmount', e.target.value)} placeholder="Enter amount" className={`${inputClass} pr-9`} /><IndianRupee className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></div></label>
                            <label><span className={labelClass}>Estimated Expense Head *</span><select value={form.expenseHead} onChange={(e) => update('expenseHead', e.target.value)} className={inputClass}><option value="">Select Expense Head</option><option>Client Meeting & Travel</option><option>Courier & Printing</option><option>Event Site Expenses</option><option>Office Supplies</option><option>Transport & Loading</option><option>Other</option></select></label>
                            <label><span className={labelClass}>Remarks (Optional)</span><input value={form.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Any additional information..." className={inputClass} /></label>
                        </div>
                        <div className="mt-4">
                            <span className={labelClass}>Attachment</span>
                            <label className="min-h-24 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/40 transition-colors">
                                <UploadCloud className="w-7 h-7 text-blue-600 mb-1" />
                                <span className="text-sm font-medium text-slate-700">{attachment ? attachment.name : 'Drag & drop files here or click to browse'}</span>
                                <span className="text-xs text-slate-500 mt-1">Supported formats: JPG, PNG, PDF (Max. 5MB)</span>
                                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                    </section>

                    <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
                        <button onClick={() => navigate('/accounts/imprest')} className="px-4 py-2.5 border border-slate-300 rounded-md bg-white text-sm font-medium text-slate-600">Cancel</button>
                        <button disabled={submitting} onClick={() => submit(true)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-md bg-white text-sm font-medium text-slate-700 disabled:opacity-50"><Save className="w-4 h-4" /> Save as Draft</button>
                        <button disabled={submitting} onClick={() => submit(false)} className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Request</button>
                    </div>
                </main>

                <aside className="w-full lg:w-[22%] flex flex-col gap-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
                        <h2 className="text-base font-medium text-slate-800 mb-3">Your Imprest Summary</h2>
                        <div className="space-y-3">
                            {[['Opening Balance', '₹ 0.00', WalletCards, 'text-blue-600'], ['Requested Amount', form.requestedAmount ? `₹ ${Number(form.requestedAmount).toLocaleString('en-IN')}` : '₹ 0.00', IndianRupee, 'text-amber-600'], ['Attachment', attachment ? '1 file' : 'No file', Paperclip, 'text-emerald-600']].map(([label, value, Icon, color]) => (
                                <div key={label} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-xs font-normal text-slate-600"><Icon className={`w-4 h-4 ${color}`} />{label}</span><span className="text-sm font-medium text-slate-800">{value}</span></div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
                        <h2 className="flex items-center gap-2 text-base font-medium text-slate-800 mb-3"><Info className="w-4 h-4 text-blue-600" /> Important Guidelines</h2>
                        <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
                            <li>Imprest is to be used for official business expenses only.</li>
                            <li>Keep all original bills and upload clear copies while claiming.</li>
                            <li>Settlement must be completed within 15 days from the expense date.</li>
                            <li>Requests are routed to the department and finance approvers.</li>
                        </ul>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
                        <h2 className="text-base font-medium text-slate-800 mb-3">Approver Preview</h2>
                        <div className="space-y-3">
                            <div><div className="text-xs text-slate-500 font-medium uppercase">Reporting Manager</div><div className="flex items-center gap-2 mt-1.5"><div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div><div><div className="text-sm font-medium text-slate-700">Department Manager</div><div className="text-xs text-slate-500">Primary approver</div></div></div></div>
                            <div><div className="text-xs text-slate-500 font-medium uppercase">Finance Approver</div><div className="flex items-center gap-2 mt-1.5"><div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div><div><div className="text-sm font-medium text-slate-700">Finance Manager</div><div className="text-xs text-slate-500">Final approver</div></div></div></div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CreateImprestRequest;
