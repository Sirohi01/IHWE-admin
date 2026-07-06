import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UploadCloud, Plus, Trash2, Calendar, FileText, Info } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const CreateCreditNote = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [accountData, setAccountData] = useState(null);
    
    // Form States
    const [creditNoteType, setCreditNoteType] = useState('Stall Size Reduction');
    const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditNoteNo, setCreditNoteNo] = useState('Auto-generating...');
    const [referenceInvoice, setReferenceInvoice] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [reason, setReason] = useState('');
    const [event, setEvent] = useState('IHWE 2026');
    const [hallStall, setHallStall] = useState('');
    const [gstin, setGstin] = useState('');
    const [remarks, setRemarks] = useState('');
    
    const [items, setItems] = useState([
        { id: 1, particular: '', qty: 1, rate: 0, amount: 0 }
    ]);
    
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        if (!id) {
            toast.error("Exhibitor ID is missing!");
            navigate(-1);
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch company/account data
                const res = await api.get(`/api/account-overview/${id}`);
                if (res.data?.success) {
                    setCompanyInfo(res.data.data.companyInfo);
                    setAccountData(res.data.data);
                    
                    setHallStall(res.data.data.companyInfo.hall || res.data.data.companyInfo.stall || 'N/A');
                    setGstin(res.data.data.companyInfo.gst_no || 'N/A');
                    
                    // Populate invoices for adjustment
                    const invs = res.data.data.invoices || [];
                    const formattedInvoices = invs.filter(inv => inv.payment_status !== 'Fully Paid').map(inv => ({
                        _id: inv._id,
                        invoice_no: inv.invoice_no,
                        invoice_date: new Date(inv.created_at).toISOString().split('T')[0],
                        invoice_amount: inv.total_amount || 0,
                        outstanding: (inv.total_amount || 0) - (inv.amount_paid || 0),
                        selected: false,
                        apply_credit: 0
                    }));
                    setInvoices(formattedInvoices);
                }

                // Generate Credit Note No
                const noRes = await api.get('/api/creditnotes'); // Just a dummy fetch to let backend handle auto-generation on create, or we can fetch a preview. 
                // We'll leave it as Auto-generating for now
                setCreditNoteNo('CN-' + new Date().getFullYear() + '-Auto');
            } catch (err) {
                console.error("Failed to fetch data", err);
                toast.error("Error loading exhibitor data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    // Derived values
    const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const gstReversal = subTotal * 0.18;
    const totalCreditNoteValue = subTotal + gstReversal;
    
    const totalApplied = invoices.filter(inv => inv.selected).reduce((sum, inv) => sum + (parseFloat(inv.apply_credit) || 0), 0);
    const remainingBalance = totalCreditNoteValue - totalApplied;

    const outstandingBeforeCN = accountData?.totalOutstanding || 0;
    const balanceAfterPosting = outstandingBeforeCN - totalCreditNoteValue;

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), particular: '', qty: 1, rate: 0, amount: 0 }]);
    };

    const handleRemoveItem = (itemId) => {
        setItems(items.filter(i => i.id !== itemId));
    };

    const handleItemChange = (itemId, field, value) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const updated = { ...item, [field]: value };
                if (field === 'qty' || field === 'rate') {
                    updated.amount = (parseFloat(updated.qty) || 0) * (parseFloat(updated.rate) || 0);
                }
                return updated;
            }
            return item;
        }));
    };

    const handleInvoiceToggle = (invId) => {
        setInvoices(invoices.map(inv => {
            if (inv._id === invId) {
                const selected = !inv.selected;
                let apply_credit = 0;
                
                // Auto-apply logic
                if (selected) {
                    const availableToApply = totalCreditNoteValue - invoices.filter(i => i.selected && i._id !== invId).reduce((s, i) => s + parseFloat(i.apply_credit || 0), 0);
                    apply_credit = Math.min(inv.outstanding, availableToApply);
                    if (apply_credit < 0) apply_credit = 0;
                }
                
                return { ...inv, selected, apply_credit };
            }
            return inv;
        }));
    };

    const handleInvoiceCreditChange = (invId, value) => {
        setInvoices(invoices.map(inv => {
            if (inv._id === invId) {
                return { ...inv, apply_credit: parseFloat(value) || 0 };
            }
            return inv;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (remainingBalance < 0) {
            toast.error("Applied credit cannot exceed Total Credit Note Value");
            return;
        }

        const dataToSend = {
            companyId: id,
            credit_note_type: creditNoteType,
            credit_note_date: creditNoteDate,
            reference_invoice_no: referenceInvoice,
            est_no: referenceInvoice, // Backward compatibility
            invoice_date: invoiceDate,
            reason,
            event,
            hall_stall: hallStall,
            gstin,
            remarks,
            sub_total: subTotal,
            gst_reversal: gstReversal,
            total_value: totalCreditNoteValue,
            adjusted_amount: totalApplied,
            remaining_balance: remainingBalance,
            status: totalApplied >= totalCreditNoteValue ? 'Fully Adjusted' : (totalApplied > 0 ? 'Partially Adjusted' : 'Draft'),
            items: items.map(item => ({
                item: item.particular,
                quantity: item.qty,
                rate: item.rate,
                cn_amount: item.rate, // Backend uses cn_amount * qty = amount
                cedit_note_remark: ''
            })),
            adjusted_invoices: invoices.filter(inv => inv.selected).map(inv => ({
                invoice_id: inv._id,
                invoice_no: inv.invoice_no,
                invoice_date: inv.invoice_date,
                invoice_amount: inv.invoice_amount,
                outstanding: inv.outstanding,
                applied_credit: inv.apply_credit
            })),
            added_by: 'Admin'
        };

        try {
            const res = await api.post('/api/creditnotes', dataToSend);
            if (res.data?.success || res.status === 201) {
                toast.success('Credit Note Created Successfully');
                navigate('/dashboard/account/credit-notes');
            }
        } catch (error) {
            toast.error('Failed to create credit note');
            console.error(error);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-semibold text-sm">Accounts / Exhibitor Account / <span className="text-slate-600 font-medium">Debit Notes</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="px-5 py-2 bg-white text-slate-700 border border-slate-200 font-bold rounded-lg hover:bg-slate-50 transition-colors text-[13px]">
                            Cancel
                        </button>
                        <button className="px-5 py-2 bg-white text-blue-600 border border-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-[13px]">
                            Save Draft
                        </button>
                        <button onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-[13px]">
                            Save & Send for Approval
                        </button>
                    </div>
                </div>

                <h1 className="text-[26px] font-black text-slate-900 mb-6 tracking-tight">Create Debit Note</h1>

                {/* Top Company Info Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-4 flex justify-between items-center">
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Exhibitor</div>
                        <h2 className="text-xl font-black text-slate-800">{companyInfo?.name || 'Company Name'}</h2>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Stall No. {hallStall}</p>
                    </div>
                    <div className="flex gap-10 text-right">
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Payable</div>
                            <div className="text-lg font-black text-slate-800">{formatCurrency(accountData?.totalInvoiceAmount)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Received</div>
                            <div className="text-lg font-black text-emerald-600">{formatCurrency(accountData?.totalAmountReceived)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Outstanding</div>
                            <div className="text-lg font-black text-rose-600">{formatCurrency(accountData?.totalOutstanding)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Status</div>
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 font-bold text-xs rounded-full inline-block mt-0.5">Part Paid</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 space-y-4">
                        {/* Credit Note Details */}
                        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-extrabold text-slate-800 text-[17px]">Debit Note Details</h3>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-[11px] rounded border border-emerald-100">Manual Entry</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Debit Note Type <span className="text-red-500">*</span></label>
                                    <select value={creditNoteType} onChange={e => setCreditNoteType(e.target.value)} className="w-full text-sm font-semibold border-slate-200 rounded-lg p-2.5 focus:ring-blue-500 outline-none">
                                        <option value="Stall Size Reduction">Stall Size Reduction</option>
                                        <option value="Discount">Discount</option>
                                        <option value="Booking Cancellation">Booking Cancellation</option>
                                        <option value="Service Adjustment">Service Adjustment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Debit Note Date <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input type="date" value={creditNoteDate} onChange={e => setCreditNoteDate(e.target.value)} className="w-full text-sm font-semibold border border-slate-200 rounded-lg p-2.5 focus:ring-blue-500 outline-none pr-10" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Debit Note No. <span className="text-red-500">*</span></label>
                                    <input type="text" value={creditNoteNo} onChange={e => setCreditNoteNo(e.target.value)} placeholder="Auto generated or enter manually" className="w-full text-sm font-semibold border border-slate-200 rounded-lg p-2.5 focus:ring-blue-500 outline-none" />
                                </div>
                                
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Reference Invoice / Document <span className="text-red-500">*</span></label>
                                    <select value={referenceInvoice} onChange={e => setReferenceInvoice(e.target.value)} className="w-full text-sm font-semibold border-slate-200 rounded-lg p-2.5 focus:ring-blue-500 outline-none">
                                        <option value="">Select Invoice</option>
                                        {invoices.map(inv => (
                                            <option key={inv._id} value={inv.invoice_no}>{inv.invoice_no} - {formatCurrency(inv.invoice_amount)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Reason for Debit Note <span className="text-red-500">*</span></label>
                                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Stall size reduced" className="w-full text-sm font-semibold border border-slate-200 rounded-lg p-2.5 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Event</label>
                                    <input type="text" value={event} onChange={e => setEvent(e.target.value)} className="w-full text-sm font-semibold border border-slate-200 bg-slate-50 text-slate-600 rounded-lg p-2.5 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Hall / Stall</label>
                                    <input type="text" value={hallStall} onChange={e => setHallStall(e.target.value)} className="w-full text-sm font-semibold border border-slate-200 bg-slate-50 text-slate-600 rounded-lg p-2.5 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">GSTIN</label>
                                    <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} className="w-full text-sm font-semibold border border-slate-200 bg-slate-50 text-slate-600 rounded-lg p-2.5 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Charge Details */}
                        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 p-6">
                            <h3 className="font-extrabold text-slate-800 text-[17px] mb-4">Charge Details <span className="text-slate-500 font-bold text-[13px]">(Items Included)</span></h3>
                            
                            <table className="w-full text-left border-collapse mb-3">
                                <thead>
                                    <tr className="bg-slate-50 border-y border-slate-100">
                                        <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-10">#</th>
                                        <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500">Particular</th>
                                        <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-24">Qty / Unit</th>
                                        <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-32">Rate (₹)</th>
                                        <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-32">Amount (₹)</th>
                                        <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-12 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="py-2 px-3 text-xs font-bold text-slate-400">{index + 1}</td>
                                            <td className="py-2 px-3">
                                                <input type="text" value={item.particular} onChange={e => handleItemChange(item.id, 'particular', e.target.value)} placeholder="Item description" className="w-full text-xs font-semibold border border-slate-200 rounded p-1.5 focus:ring-blue-500 outline-none" />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', e.target.value)} className="w-full text-xs font-semibold border border-slate-200 rounded p-1.5 focus:ring-blue-500 outline-none" min="1" />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} className="w-full text-xs font-semibold border border-slate-200 rounded p-1.5 focus:ring-blue-500 outline-none" min="0" />
                                            </td>
                                            <td className="py-2 px-3 text-sm font-bold text-slate-700 bg-slate-50/50">
                                                {formatCurrency(item.amount)}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1" disabled={items.length === 1}>
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div className="flex justify-between items-start">
                                <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 text-blue-600 font-bold text-[11px] hover:text-blue-800 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add Another Item
                                </button>
                                
                                <div className="w-64">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-[11px] font-bold text-slate-500">Sub Total</span>
                                        <span className="text-[11px] font-black text-slate-800">{formatCurrency(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-[11px] font-bold text-slate-500">GST (18%)</span>
                                        <span className="text-[11px] font-black text-slate-800">{formatCurrency(gstReversal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-t border-slate-200 mt-2">
                                        <span className="text-[13px] font-bold text-blue-600">Total Debit Note Value</span>
                                        <span className="text-[15px] font-black text-blue-600">{formatCurrency(totalCreditNoteValue)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Adjust Against Invoices */}
                        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-extrabold text-slate-800 text-[17px]">Apply Debit Note to Outstanding</h3>
                                <span className="text-xs font-semibold text-slate-400">Auto allocation can be edited</span>
                            </div>
                            
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-y border-slate-100">
                                        <th className="py-2.5 px-3 w-8"></th>
                                        <th className="py-2.5 px-3 text-[11px] font-extrabold text-slate-700">Invoice No.</th>
                                        <th className="py-2.5 px-3 text-[11px] font-extrabold text-slate-700">Invoice Date</th>
                                        <th className="py-2.5 px-3 text-[11px] font-extrabold text-slate-700 text-right">Invoice Amount (₹)</th>
                                        <th className="py-2.5 px-3 text-[11px] font-extrabold text-slate-700 text-right">Outstanding (₹)</th>
                                        <th className="py-2.5 px-3 text-[11px] font-extrabold text-slate-700 text-center w-36">Apply Debit (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {invoices.length === 0 && (
                                        <tr><td colSpan="6" className="py-4 text-center text-xs text-slate-400">No outstanding invoices available.</td></tr>
                                    )}
                                    {invoices.map(inv => (
                                        <tr key={inv._id} className={inv.selected ? 'bg-blue-50/30' : ''}>
                                            <td className="py-2 px-3">
                                                <input type="checkbox" checked={inv.selected} onChange={() => handleInvoiceToggle(inv._id)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                            </td>
                                            <td className="py-2 px-3 text-xs font-bold text-slate-700">{inv.invoice_no}</td>
                                            <td className="py-2 px-3 text-xs text-slate-500 font-medium">{new Date(inv.invoice_date).toLocaleDateString('en-GB')}</td>
                                            <td className="py-2 px-3 text-xs text-right font-bold text-slate-700">{formatCurrency(inv.invoice_amount)}</td>
                                            <td className="py-2 px-3 text-xs text-right font-bold text-rose-600">{formatCurrency(inv.outstanding)}</td>
                                            <td className="py-2 px-3 text-right">
                                                <input type="number" disabled={!inv.selected} value={inv.apply_credit} onChange={(e) => handleInvoiceCreditChange(inv._id, e.target.value)} className="w-full text-xs font-bold border border-slate-200 rounded p-1.5 focus:ring-blue-500 outline-none text-right disabled:bg-slate-50 disabled:text-slate-400" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div className="flex justify-end mt-4">
                                <div className="w-80 p-5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                                    <div className="flex justify-between items-center py-1.5">
                                        <span className="text-xs font-bold text-slate-600">Debit Note Value</span>
                                        <span className="text-sm font-black text-slate-800">{formatCurrency(totalCreditNoteValue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5">
                                        <span className="text-xs font-bold text-slate-600">Total Applied</span>
                                        <span className="text-sm font-black text-slate-800">{formatCurrency(totalApplied)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-t border-emerald-200 mt-2">
                                        <span className={`text-[13px] font-black ${remainingBalance === 0 ? 'text-emerald-600' : 'text-orange-500'}`}>Remaining Debit Balance</span>
                                        <span className={`text-base font-black ${remainingBalance === 0 ? 'text-emerald-600' : 'text-orange-500'}`}>{formatCurrency(remainingBalance)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remarks and Attachments */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Remarks</label>
                                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full text-sm font-semibold border border-slate-200 rounded-lg p-2.5 h-24 resize-none focus:ring-blue-500 outline-none" placeholder="Add any notes here..."></textarea>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Attachments</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg h-24 flex flex-col items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer">
                                    <UploadCloud className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] font-bold">Drag & drop files here</span>
                                    <span className="text-[9px] font-medium">PDF, JPG, PNG up to 5 MB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Summary */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 p-6">
                            <h3 className="font-extrabold text-slate-800 text-[17px] mb-5">Debit Note Summary</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Invoice / PI Amount</span>
                                    <span className="text-sm font-bold text-slate-800">{formatCurrency(accountData?.totalInvoiceAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Already Received</span>
                                    <span className="text-sm font-bold text-slate-800">{formatCurrency(accountData?.totalAmountReceived)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Outstanding Before DN</span>
                                    <span className="text-sm font-bold text-slate-800">{formatCurrency(outstandingBeforeCN)}</span>
                                </div>
                                <div className="flex justify-between items-center text-blue-600">
                                    <span className="text-xs font-bold">Debit Note Amount</span>
                                    <span className="text-sm font-black">{formatCurrency(totalCreditNoteValue)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">TDS Deduction</span>
                                    <span className="text-sm font-bold text-slate-800">₹0.00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Adjustment / Debit Note</span>
                                    <span className="text-sm font-bold text-slate-800">₹0.00</span>
                                </div>
                                
                                <div className="bg-slate-900 rounded-lg p-4 mt-4 text-white">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-slate-300">Balance After Posting</span>
                                        <span className="text-lg font-black">{formatCurrency(balanceAfterPosting)}</span>
                                    </div>
                                    <div className="text-[9px] font-medium text-slate-400">(This will be the new outstanding)</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <h3 className="font-extrabold text-slate-800 text-lg mb-4">Debit Note Preview</h3>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-[11px] font-semibold text-slate-500">Credit Note No.</span>
                                    <span className="text-[11px] font-bold text-slate-800">{creditNoteNo}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-[11px] font-semibold text-slate-500">Date</span>
                                    <span className="text-[11px] font-bold text-slate-800">{new Date(creditNoteDate).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-[11px] font-semibold text-slate-500">Exhibitor</span>
                                    <span className="text-[11px] font-bold text-slate-800 max-w-[120px] text-right truncate">{companyInfo?.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-[11px] font-semibold text-slate-500">Status</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Draft</span>
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                <h4 className="text-[11px] font-bold text-amber-800 mb-2">Accounts Check:</h4>
                                <ul className="space-y-1.5">
                                    <li className="flex items-start gap-1.5 text-[10px] font-semibold text-amber-700">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                        Credit note amount is within outstanding limit.
                                    </li>
                                    <li className="flex items-start gap-1.5 text-[10px] font-semibold text-amber-700">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                        GST reversal is calculated correctly.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCreditNote;
