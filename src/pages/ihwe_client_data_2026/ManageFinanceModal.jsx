import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/api';
import Swal from 'sweetalert2';

const ManageFinanceModal = ({ client, events, settings, onClose, onSave }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentPlanType, setPaymentPlanType] = useState(client?.paymentPlanType || 'full');
    const [chosenTdsPercent, setChosenTdsPercent] = useState(client?.chosenTdsPercent || 0);
    const [financeBreakdown, setFinanceBreakdown] = useState(client?.financeBreakdown || {});

    // Find the event for this client
    const currentEvent = events.find(e => e._id === (client.eventId?._id || client.eventId)) || null;

    useEffect(() => {
        if (!currentEvent) return;

        const baseCost = client.participation?.amount || client.participation?.subtotal1 || 0; // The base cost without GST or TDS
        let subtotal1 = client.financeBreakdown?.subtotal1 || baseCost;

        // Organization-wide Full Payment Discount
        const plans = currentEvent?.paymentPlans || [];
        const selectedPlan = plans.find(p => p.id === paymentPlanType);

        // A payment is "full" if the plan ID is 'full' OR if the percentage is 100
        const isFull = paymentPlanType === 'full' || (selectedPlan && Number(selectedPlan.percentage) === 100);

        const fpDiscountPct = isFull ? (settings?.fullPaymentDiscount || 0) : 0;
        const fpDiscountAmt = Math.round(subtotal1 * fpDiscountPct / 100);
        const subtotal2 = subtotal1 - fpDiscountAmt;

        // GST 18% on taxable value (subtotal2)
        const gstAmt = Math.round(subtotal2 * 0.18);

        // Invoice total (subtotal2 + GST)
        const invoiceTotal = subtotal2 + gstAmt;

        // TDS on taxable value only (subtotal2)
        const tdsPct = chosenTdsPercent || 0;
        const tdsAmt = Math.round(subtotal2 * tdsPct / 100);

        // Net cash payable by buyer
        const netPayable = invoiceTotal - tdsAmt;

        setFinanceBreakdown({
            ...client.financeBreakdown, // Keep stall discount details if they exist
            subtotal1: Math.round(subtotal1),
            discountPercent: fpDiscountPct,
            discountAmount: Math.round(fpDiscountAmt),
            subtotal: Math.round(subtotal2),
            gstAmount: gstAmt,
            tdsPercent: tdsPct,
            tdsAmount: tdsAmt,
            netPayable: Math.round(netPayable),
            isFullPayment: isFull
        });
    }, [paymentPlanType, chosenTdsPercent, currentEvent, settings, client]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Find plan label
            const plans = currentEvent?.paymentPlans || [];
            const selectedPlan = plans.find(p => p.id === paymentPlanType);
            const planLabel = selectedPlan ? selectedPlan.label : 'Full Payment (100%)';

            const amountPaid = client.amountPaid || 0;
            const newBalanceAmount = Math.max(0, financeBreakdown.netPayable - amountPaid);

            const updateData = {
                paymentPlanType,
                paymentPlanLabel: planLabel,
                chosenTdsPercent,
                financeBreakdown,
                balanceAmount: newBalanceAmount
            };

            const response = await api.put(`/api/exhibitor-registration/${client._id}`, updateData);

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Finance Details Updated',
                    text: 'Payment plan and TDS have been successfully updated for this client.'
                });
                onSave();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to update finance details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentEvent) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-xl w-full max-w-lg p-6 flex flex-col items-center">
                    <p className="text-slate-500 mb-4">Event details not found. Unable to configure finance.</p>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl flex flex-col shadow-2xl max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Manage Finance & Billing</h2>
                        <p className="text-xs text-slate-500">{client.exhibitorName || client.companyName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT: Controls */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Plan *</label>
                                <select
                                    value={paymentPlanType}
                                    onChange={(e) => setPaymentPlanType(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {!currentEvent?.paymentPlans?.some(p => Number(p.percentage) === 100 || p.id === 'full') && (
                                        <option value="full">Full Payment (100%)</option>
                                    )}
                                    {currentEvent?.paymentPlans?.map(plan => (
                                        <option key={plan.id} value={plan.id}>{plan.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">TDS Deduction (Optional)</label>
                                <select
                                    value={chosenTdsPercent}
                                    onChange={(e) => setChosenTdsPercent(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value={0}>0% - No TDS</option>
                                    <option value={1}>1% - Section 194Q (Goods)</option>
                                    <option value={2}>2% - Section 194C (Contract)</option>
                                    <option value={10}>10% - Section 194J (Professional Services)</option>
                                </select>
                            </div>
                        </div>

                        {/* RIGHT: Breakdown */}
                        <div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider text-center">Financial Settlement Breakdown</h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Gross Stall Cost</span>
                                        <span className="font-semibold text-slate-800">₹ {(financeBreakdown.grossAmount || financeBreakdown.subtotal1 || 0).toLocaleString()}</span>
                                    </div>

                                    {(financeBreakdown.stallDiscountAmount > 0) && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Less: Stall Discount ({financeBreakdown.stallDiscountPercent}%)</span>
                                            <span className="font-semibold">- ₹ {financeBreakdown.stallDiscountAmount?.toLocaleString()}</span>
                                        </div>
                                    )}

                                    {(financeBreakdown.discountAmount > 0) && (
                                        <div className="flex justify-between text-amber-600">
                                            <span>Less: FP Discount ({financeBreakdown.discountPercent}%)</span>
                                            <span className="font-semibold">- ₹ {financeBreakdown.discountAmount?.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                                        <span>Taxable Value (Subtotal)</span>
                                        <span className="font-semibold text-slate-800">₹ {(financeBreakdown.subtotal || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between text-blue-600">
                                        <span>Add: GST @ 18%</span>
                                        <span className="font-semibold">+ ₹ {(financeBreakdown.gstAmount || 0).toLocaleString()}</span>
                                    </div>

                                    {(financeBreakdown.tdsAmount > 0) && (
                                        <div className="flex justify-between text-rose-600">
                                            <span>Less: TDS @ {financeBreakdown.tdsPercent}%</span>
                                            <span className="font-semibold">- ₹ {financeBreakdown.tdsAmount?.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-3 mt-3 border-t-2 border-slate-300">
                                        <span className="font-bold text-slate-900">Total Net Payable</span>
                                        <span className="font-bold text-emerald-700 text-lg">₹ {(financeBreakdown.netPayable || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center min-w-[120px]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageFinanceModal;
