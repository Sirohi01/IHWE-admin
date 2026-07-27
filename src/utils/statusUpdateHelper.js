import Swal from 'sweetalert2';

export const handleStatusUpdate = async (id, newStatus, regData, api, dispatch, createActivityLogThunk, fetchRegistrations) => {
    const getUserInfo = () => {
        const raw = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        let user = {};
        try { user = raw ? JSON.parse(raw) : {}; } catch { user = {}; }
        const userId = user._id || user.id || sessionStorage.getItem("user_id");
        const userName = user.fullName || user.username || "User";
        return { userId, userName };
    };

        if (newStatus === 'paid' || newStatus === 'advance-paid') {
            const isAdvance = newStatus === 'advance-paid';
            const fb = regData?.financeBreakdown || {};
            const totalAmount = fb.netPayable || regData?.participation?.total || 0;
            const history = regData?.paymentHistory || [];
            const alreadyPaid = history.reduce((sum, h) => sum + (h.amount || 0), 0);
            const remainingAmount = Math.max(0, totalAmount - alreadyPaid);
            const collectAmount = isAdvance ? totalAmount : remainingAmount;
            const isFirstPayment = history.length === 0;
            const cur = regData?.participation?.currency === 'USD' ? '$' : '₹';
            const fmtAmt = (n) => cur + ' ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

            const paymentPlans = regData?.eventId?.paymentPlans || [];
            const installmentPlans = paymentPlans.filter(p => Number(p.percentage) > 0 && Number(p.percentage) < 100);
            const defaultPcts = installmentPlans.length > 0 ? installmentPlans.map(p => Number(p.percentage)) : [25, 30, 40, 50, 60, 75];
            const defaultSelectedPct = defaultPcts.length > 0 ? defaultPcts[0] : 50;
            const installmentBase = alreadyPaid > 0 ? remainingAmount : totalAmount;

            const nextPaymentNo = history.length + 1;

            let pctButtons = '';
            defaultPcts.forEach((p, idx) => {
                const planLabel = installmentPlans.find(plan => Number(plan.percentage) === p)?.label || (p + '%');
                const isDefault = idx === 0;
                const isAlreadyPaid = idx < history.length;

                let btnStyle = 'padding:5px 10px;border:1px solid #e2e8f0;border-radius:6px;font-weight:900;font-size:11px;transition:all 0.2s;white-space:nowrap;';
                if (isAlreadyPaid) {
                    btnStyle += 'background:#f1f5f9;color:#94a3b8;cursor:not-allowed;text-decoration:line-through;';
                } else if (isDefault) {
                    btnStyle += 'background:#334155;color:#fff;cursor:pointer;';
                } else {
                    btnStyle += 'background:#fff;color:#334155;cursor:pointer;';
                }

                pctButtons += `<button type="button" ${isAlreadyPaid ? 'disabled' : ''} data-pct="${p}" onclick="window.selectPct(${p},${installmentBase},'${cur}')" `
                    + `class="pct-btn" style="${btnStyle}">${planLabel}</button>`;
            });
            const allPhasesDone = history.length >= defaultPcts.length;
            if (allPhasesDone && remainingAmount > 0) {
                const remainBtnStyle = 'padding:5px 10px;border:2px solid #23471d;border-radius:6px;font-weight:900;font-size:11px;background:#23471d;color:#fff;cursor:pointer;white-space:nowrap;';
                pctButtons += `<button type="button" data-pct="remaining" onclick="window.selectPctRemaining(${remainingAmount},'${cur}')" `
                    + `class="pct-btn" style="${remainBtnStyle}">Pay Remaining Balance</button>`;
            }

            window.selectPct = (p, base, currency) => {
                const amt = base * p / 100;
                const percentInput = document.getElementById('swal-percent');
                if (percentInput) percentInput.value = p;

                const amtDisplay = document.getElementById('swal-amt-display');
                const balDisplay = document.getElementById('swal-balance-display');

                if (amtDisplay) amtDisplay.textContent = currency + ' ' + amt.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                if (balDisplay) balDisplay.textContent = currency + ' ' + (base - amt).toLocaleString('en-IN', { maximumFractionDigits: 2 });

                document.querySelectorAll('.pct-btn').forEach(b => {
                    if (b.disabled) return;
                    b.style.background = '#fff';
                    b.style.color = '#334155';
                });
                const active = document.querySelector('.pct-btn[data-pct="' + p + '"]');
                if (active && !active.disabled) { active.style.background = '#334155'; active.style.color = '#fff'; }
            };

            window.selectPctRemaining = (remainAmt, currency) => {
                const percentInput = document.getElementById('swal-percent');
                if (percentInput) percentInput.value = 'remaining';
                const amtDisplay = document.getElementById('swal-amt-display');
                const balDisplay = document.getElementById('swal-balance-display');
                if (amtDisplay) amtDisplay.textContent = currency + ' ' + remainAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                if (balDisplay) balDisplay.textContent = currency + ' 0';
                document.querySelectorAll('.pct-btn').forEach(b => {
                    if (b.disabled) return;
                    b.style.background = '#fff';
                    b.style.color = '#334155';
                    b.style.border = '1px solid #e2e8f0';
                });
                const active = document.querySelector('.pct-btn[data-pct="remaining"]');
                if (active) { active.style.background = '#23471d'; active.style.color = '#fff'; }
            };            const historyListHTML = history.length > 0 ? `
                <div style="margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px">
                    <p style="font-size: 8px; font-weight: 900; color: #64748b; text-transform: uppercase; margin: 0 0 4px 0">Payment History</p>
                    ${history.map((h, i) => `
                        <div style="display: flex; justify-content: space-between; font-size: 10px; padding: 1px 0;">
                            <span style="color: #94a3b8">#${i + 1} (${new Date(h.paidAt).toLocaleDateString()})</span>
                            <span style="font-weight: 800; color: #475569">${fmtAmt(h.amount)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : '';
            const fbBreakdownHTML = `
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;margin-bottom:6px">
                    <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;margin:0 0 4px 0;letter-spacing:0.08em">Financial Breakdown</p>
                    <div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Taxable Value (Subtotal)</span>
                        <span style="font-size:11px;font-weight:700;color:#0f172a">${fmtAmt(fb.subtotal || 0)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Add: GST @ 18%</span>
                        <span style="font-size:11px;font-weight:700;color:#1d4ed8">+ ${fmtAmt(fb.gstAmount || 0)}</span>
                    </div>
                    ${fb.tdsAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#dc2626">Less: TDS @ ${fb.tdsPercent || 0}%</span>
                        <span style="font-size:11px;font-weight:700;color:#dc2626">- ${fmtAmt(fb.tdsAmount)}</span>
                    </div>` : ''}
                    <div style="display:flex;justify-content:space-between;padding:2px 0 0 0;margin-top:2px">
                        <span style="font-size:12px;font-weight:900;color:#0f172a">Total Net Payable</span>
                        <span style="font-size:13px;font-weight:900;color:#23471d">${fmtAmt(totalAmount)}</span>
                    </div>
                </div>
            `;

            const advanceHTML = `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px;margin-bottom:8px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                        <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#475569;margin:0">RECORD INSTALLMENT #${nextPaymentNo}</p>
                        <span style="background:#e2e8f0;color:#475569;font-size:8px;font-weight:900;padding:3px 10px;border-radius:100px">${nextPaymentNo}${nextPaymentNo === 1 ? 'ST' : nextPaymentNo === 2 ? 'ND' : nextPaymentNo === 3 ? 'RD' : 'TH'} PAYMENT</span>
                    </div>
                    ${fbBreakdownHTML}
                    ${alreadyPaid > 0 ? `
                        <div style="display:flex;justify-content:space-between;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;margin-bottom:6px">
                            <div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#94a3b8;margin:0 0 2px 0">Already Paid</p>
                            <p style="font-size:13px;font-weight:900;color:#475569;margin:0">${fmtAmt(alreadyPaid)}</p></div>
                            <div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#94a3b8;margin:0 0 2px 0">Remaining</p>
                            <p style="font-size:13px;font-weight:900;color:#dc2626;margin:0">${fmtAmt(remainingAmount)}</p></div>
                        </div>
                    ` : ''}
                    ${historyListHTML}
                    <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;margin:6px 0 2px 0">Select Installment Phase</p>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-bottom:6px;overflow-x:auto">${pctButtons}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                        <div style="background:white;padding:8px;border-radius:8px;border:1px solid #e2e8f0">
                            <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#94a3b8;margin:0 0 2px 0">Amount to Collect</p>
                            <p id="swal-amt-display" style="font-size:16px;font-weight:900;color:#23471d;margin:0">${allPhasesDone ? fmtAmt(remainingAmount) : fmtAmt(installmentBase * defaultSelectedPct / 100)}</p>
                        </div>
                        <div style="background:white;padding:8px;border-radius:8px;border:1px solid #e2e8f0">
                            <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#94a3b8;margin:0 0 2px 0">Balance After This</p>
                            <p id="swal-balance-display" style="font-size:16px;font-weight:900;color:#dc2626;margin:0">${allPhasesDone ? fmtAmt(0) : fmtAmt(installmentBase - (installmentBase * defaultSelectedPct / 100))}</p>
                        </div>
                    </div>
                    <input type="hidden" id="swal-percent" value="${allPhasesDone ? 'remaining' : defaultSelectedPct}">
                </div>
            `;
            const fullDiscountNote = isFirstPayment && fb.discountAmount > 0
                ? `<div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:6px 10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#854d0e;margin:0 0 2px 0">Full Payment Discount Applied</p>
                        <p style="font-size:12px;font-weight:700;color:#854d0e;margin:0">${fb.discountPercent}% discount = - ${fmtAmt(fb.discountAmount)}</p>
                    </div>
                    <span style="background:#f59e0b;color:white;font-size:9px;font-weight:900;padding:4px 12px;border-radius:100px">SAVINGS</span>
                  </div>`
                : '';

            const fullBreakdownHTML = `
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;margin-bottom:6px">
                    <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;margin:0 0 4px 0;letter-spacing:0.08em">Financial Breakdown</p>
                    <div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Gross Stall Cost</span>
                        <span style="font-size:11px;font-weight:700;color:#0f172a">${fmtAmt(fb.grossAmount || 0)}</span>
                    </div>
                    ${fb.stallDiscountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#16a34a">Less: Stall Discount (${fb.stallDiscountPercent || 0}%)</span>
                        <span style="font-size:11px;font-weight:700;color:#16a34a">- ${fmtAmt(fb.stallDiscountAmount)}</span>
                    </div>` : ''}
                    ${fb.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#d97706">Less: Full Payment Discount (${fb.discountPercent || 0}%)</span>
                        <span style="font-size:11px;font-weight:700;color:#d97706">- ${fmtAmt(fb.discountAmount)}</span>
                    </div>` : ''}
                    <div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Taxable Value (Subtotal)</span>
                        <span style="font-size:11px;font-weight:700;color:#0f172a">${fmtAmt(fb.subtotal || 0)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Add: GST @ 18%</span>
                        <span style="font-size:11px;font-weight:700;color:#1d4ed8">+ ${fmtAmt(fb.gstAmount || 0)}</span>
                    </div>
                    ${fb.tdsAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#dc2626">Less: TDS @ ${fb.tdsPercent || 0}%</span>
                        <span style="font-size:11px;font-weight:700;color:#dc2626">- ${fmtAmt(fb.tdsAmount)}</span>
                    </div>` : ''}
                    <div style="display:flex;justify-content:space-between;padding:2px 0 0 0;margin-top:2px">
                        <span style="font-size:12px;font-weight:900;color:#0f172a">Total Net Payable</span>
                        <span style="font-size:13px;font-weight:900;color:#23471d">${fmtAmt(totalAmount)}</span>
                    </div>
                </div>
            `;

            const fullHTML = `
                <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:8px;margin-bottom:8px">
                    ${fullDiscountNote}
                    ${fullBreakdownHTML}
                    ${alreadyPaid > 0 ? `
                        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:6px 10px;margin-bottom:6px;display:flex;justify-content:space-between">
                            <div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#854d0e;margin:0 0 2px 0">Already Paid</p>
                            <p style="font-size:13px;font-weight:900;color:#854d0e;margin:0">${fmtAmt(alreadyPaid)}</p></div>
                            <div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#166534;margin:0 0 2px 0">Contract Total</p>
                            <p style="font-size:13px;font-weight:900;color:#166534;margin:0">${fmtAmt(totalAmount)}</p></div>
                        </div>
                        ${historyListHTML}
                    ` : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center;background:#dcfce7;border-radius:8px;padding:8px 10px">
                        <div>
                            <p style="font-size:10px;font-weight:900;text-transform:uppercase;color:#166534;margin:0 0 2px 0">${alreadyPaid > 0 ? 'Balance to Collect (Remaining)' : 'Full Amount to be Collected'}</p>
                            <p style="font-size:20px;font-weight:900;color:#14532d;margin:0">${fmtAmt(collectAmount)}</p>
                        </div>
                        <span style="background:#22c55e;color:white;font-size:9px;font-weight:900;padding:5px 12px;border-radius:100px;text-transform:uppercase">${alreadyPaid > 0 ? 'BALANCE SETTLEMENT' : 'FULL SETTLEMENT'}</span>
                    </div>
                </div>
            `;

            const commonFields = '<div style="margin-bottom:6px">'
                + '<label style="display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:2px">Payment Method *</label>'
                + '<select id="swal-method" style="width:100%;padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-weight:700;font-size:13px">'
                + '<option value="Bank Transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>'
                + '<option value="Cash">Cash Deposit</option>'
                + '<option value="Cheque">Cheque</option>'
                + '<option value="UPI">UPI</option>'
                + '<option value="DD">Demand Draft (DD)</option>'
                + '<option value="Other">Other</option>'
                + '</select></div>'
                + '<div style="margin-bottom:6px">'
                + '<label style="display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:2px">Transaction / Reference ID *</label>'
                + '<input id="swal-txid" style="width:100%;padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-weight:700;font-size:13px;box-sizing:border-box" placeholder="UTR / Ref No. / Cheque No."></div>'
                + '<div style="margin-bottom:6px">'
                + '<label style="display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:2px">Upload Receipt *</label>'
                + '<input type="file" id="swal-file" style="width:100%;padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;box-sizing:border-box" accept="image/*"></div>'
                + '<div><label style="display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:2px">Admin Notes</label>'
                + '<textarea id="swal-notes" style="width:100%;padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-weight:600;font-size:12px;box-sizing:border-box;resize:none;height:40px" placeholder="Internal notes..."></textarea></div>';

            const { value: formValues } = await Swal.fire({
                title: isAdvance ? 'INSTALLMENT PAYMENT DETAILS' : 'FULL PAYMENT VERIFICATION',
                width: 580,
                html: '<div style="font-family:sans-serif;text-align:left;padding:4px 4px">'
                    + (isAdvance ? advanceHTML : fullHTML)
                    + commonFields + '</div>',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: isAdvance ? '✓ CONFIRM INSTALLMENT' : '✓ CONFIRM FULL PAYMENT',
                confirmButtonColor: '#23471d',
                cancelButtonColor: '#94a3b8',
                didOpen: () => { document.body.style.overflow = 'hidden'; },
                willClose: () => { document.body.style.overflow = ''; },
                preConfirm: () => {
                    const method = document.getElementById('swal-method').value;
                    const txid = document.getElementById('swal-txid').value.trim();
                    const file = document.getElementById('swal-file').files[0];
                    const notes = document.getElementById('swal-notes').value;
                    const percentRaw = isAdvance ? document.getElementById('swal-percent').value : '100';
                    const isRemaining = percentRaw === 'remaining';
                    const percent = isRemaining ? 100 : parseFloat(percentRaw);

                    if (!txid) return Swal.showValidationMessage('Transaction / Reference ID is required');
                    if (!file) return Swal.showValidationMessage('Receipt file is required');
                    if (isAdvance && !isRemaining && (percent < 1 || percent > 99)) return Swal.showValidationMessage('Installment % must be between 1 and 99');

                    const thisInstallment = isAdvance
                        ? (isRemaining ? parseFloat(remainingAmount.toFixed(2)) : parseFloat((installmentBase * percent / 100).toFixed(2)))
                        : parseFloat(collectAmount.toFixed(2));
                    const newTotalPaid = parseFloat((alreadyPaid + thisInstallment).toFixed(2));
                    const balanceAmount = parseFloat(Math.max(0, totalAmount - newTotalPaid).toFixed(2));
                    return { method, txid, file, notes, percent, amountPaid: newTotalPaid, balanceAmount, thisInstallment };
                }
            });

            if (formValues) {
                Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                try {
                    const fd = new FormData();
                    fd.append('receipt', formValues.file);
                    const uploadRes = await api.post('/api/exhibitor-registration/upload-receipt', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (uploadRes.data.success) {
                        const isFullyPaidNow = formValues.balanceAmount <= 1;
                        const finalStatus = isFullyPaidNow ? 'paid' : newStatus;

                        const updateData = {
                            status: finalStatus,
                            receiptUrl: uploadRes.data.url,
                            paymentId: formValues.txid,
                            amountPaid: formValues.amountPaid,
                            balanceAmount: formValues.balanceAmount,
                            paymentMode: 'manual',
                            paymentType: isAdvance ? 'installment' : 'full',
                            updatedByName: getUserInfo().userName,
                            manualPaymentDetails: {
                                method: formValues.method,
                                transactionId: formValues.txid,
                                notes: formValues.notes,
                                advancePercent: isAdvance ? formValues.percent : 100,
                                updatedAt: new Date()
                            }
                        };
                        const response = await api.put(`/api/exhibitor-registration/${id}`, updateData);
                        if (response.data.success) {
                            const { userId, userName } = getUserInfo();
                            if (userId) {
                                dispatch(createActivityLogThunk({
                                    user_id: userId,
                                    message: `Exhibitor: Updated payment for '${regData.exhibitorName}' in ${regData.eventId?.name || 'N/A'} (Status: ${finalStatus}) by ${userName}`,
                                    section: "Book A Stand",
                                    data: {
                                        action: "UPDATE",
                                        booking_id: id,
                                        exhibitor: regData.exhibitorName,
                                        new_status: finalStatus,
                                        payment_details: updateData
                                    }
                                }));
                            }

                            Swal.fire({
                                icon: 'success',
                                title: isAdvance ? 'INSTALLMENT RECORDED' : 'PAYMENT VERIFIED',
                                html: isAdvance
                                    ? `<b>${cur} ${formValues.thisInstallment?.toLocaleString()}</b> received.<br/>Total paid: <b>${cur} ${formValues.amountPaid?.toLocaleString()}</b><br/>Balance pending: <b style="color:#dc2626">${cur} ${formValues.balanceAmount?.toLocaleString()}</b>`
                                    : 'Registration marked as <b>FULLY PAID</b>. Receipt emailed.',
                                confirmButtonColor: '#23471d'
                            });
                            fetchRegistrations();
                        }
                    }
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Failed to process', 'error');
                }
            }
            return;
        }

        try {
            Swal.fire({
                title: 'Updating Status...',
                html: 'Please wait...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await api.put(`/api/exhibitor-registration/${id}`, { status: newStatus, updatedByName: getUserInfo().userName });
            if (response.data.success) {
                const reg = regData;
                const { userId, userName } = getUserInfo();
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Exhibitor: Updated status for '${reg?.exhibitorName || id}' to '${newStatus}' by ${userName}`,
                        section: "Book A Stand",
                        data: {
                            action: "UPDATE",
                            booking_id: id,
                            exhibitor: reg?.exhibitorName,
                            new_status: newStatus
                        }
                    }));
                }
                Swal.fire('Updated!', `Status changed to ${newStatus}`, 'success');
                fetchRegistrations();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };
