import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Receipt, Trash2, Wallet, X, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import api, { API_URL } from '../lib/api';
import { buyerBelongsToEvent } from '../lib/visitorEventScope';
import { useActiveEvents } from './BuyerEventTabs';

// Same lists the exhibitor Account screen uses.
const PAYMENT_MODES = ['NEFT', 'IMPS', 'RTGS', 'UPI', 'Cash', 'Cheque', 'Card', 'Wallet', 'Other'];
const PAYMENT_TYPES = ['Advance Payment', 'Final Payment', 'Full Payment', 'Running Payment'];
const INVOICE_TYPES = ['Interstate Sale', 'Intrastate', 'Foreign Sale'];
const CARD_SHADOW = { boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' };
const fieldCls = 'w-full h-[32px] rounded border border-slate-200 bg-white px-2 outline-none text-[11px] font-semibold text-[#0A2947] focus:border-emerald-500';
const labelCls = 'text-[10px] font-semibold text-gray-500 mb-1 block';
const EMPTY_ITEM = { description: '', hsn: '998596', qty: 1, unit: 'Nos', rate: '', discountPct: 0, gstPct: 18 };

const money = (v) => `₹${(Number(v) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const isCancelled = (d) => String(d?.status || '').toLowerCase() === 'cancelled';
const today = () => new Date().toISOString().split('T')[0];

const Modal = ({ title, onClose, children, footer, wide }) => (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50">
        <div className={`w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} max-h-[92vh] overflow-y-auto bg-white rounded-xl shadow-2xl`}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-100 sticky top-0 z-10">
                <h3 className="text-[13px] font-bold text-[#15173D] uppercase">{title}</h3>
                <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="p-4">{children}</div>
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 sticky bottom-0">{footer}</div>
        </div>
    </div>
);

const lineTotal = (it) => {
    const amount = (Number(it.qty) || 0) * (Number(it.rate) || 0);
    const taxable = amount - (amount * (Number(it.discountPct) || 0)) / 100;
    return taxable + (taxable * (it.gstPct === '' ? 18 : Number(it.gstPct) || 0)) / 100;
};

// Items editor shared by "Create PI" and "Create Invoice (direct)".
const ItemsEditor = ({ items, setItems }) => {
    const update = (i, key, value) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
    return (
        <div className="space-y-2">
            {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 sm:col-span-3">
                        {i === 0 && <label className={labelCls}>Description *</label>}
                        <input className={fieldCls} value={it.description} onChange={(e) => update(i, 'description', e.target.value)} placeholder="e.g. Standard Buyer Pass" />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                        {i === 0 && <label className={labelCls}>HSN/SAC Code</label>}
                        <input className={fieldCls} value={it.hsn} onChange={(e) => update(i, 'hsn', e.target.value)} placeholder="998596" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        {i === 0 && <label className={labelCls}>Qty</label>}
                        <input type="number" min="0" className={fieldCls} value={it.qty} onChange={(e) => update(i, 'qty', e.target.value)} />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                        {i === 0 && <label className={labelCls}>Rate (₹)</label>}
                        <input type="number" min="0" className={fieldCls} value={it.rate} onChange={(e) => update(i, 'rate', e.target.value)} />
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                        {i === 0 && <label className={labelCls}>Disc %</label>}
                        <input type="number" min="0" className={fieldCls} value={it.discountPct} onChange={(e) => update(i, 'discountPct', e.target.value)} />
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                        {i === 0 && <label className={labelCls}>GST %</label>}
                        <input type="number" min="0" className={fieldCls} value={it.gstPct} onChange={(e) => update(i, 'gstPct', e.target.value)} />
                    </div>
                    <div className="col-span-7 sm:col-span-1 text-right text-[11px] font-bold text-slate-700 pb-2">{money(lineTotal(it))}</div>
                    <div className="col-span-2 sm:col-span-1 flex justify-end pb-1">
                        {items.length > 1 && (
                            <button type="button" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                        )}
                    </div>
                </div>
            ))}
            <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])} className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline">
                    <Plus size={12} /> Add item
                </button>
                <span className="text-[12px] font-bold text-[#15173D]">Total: {money(items.reduce((sum, it) => sum + lineTotal(it), 0))}</span>
            </div>
        </div>
    );
};

const BuyerAccountsPanel = ({ lead, onChanged }) => {
    const navigate = useNavigate();
    const events = useActiveEvents();
    const [accounts, setAccounts] = useState(null);
    const [modal, setModal] = useState(null); // 'pi' | 'invoice' | 'payment'
    const [saving, setSaving] = useState(false);

    // CrmEvent this buyer belongs to (Accounts documents are event-scoped); picked by hand if unmatched.
    const matchedEvent = useMemo(() => events.find((ev) => buyerBelongsToEvent(lead, ev) && lead.eventName) || null, [events, lead]);
    const [pickedEventId, setPickedEventId] = useState('');
    const crmEventId = matchedEvent?._id || pickedEventId;

    const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
    const [remarks, setRemarks] = useState('');
    const [supplyDate, setSupplyDate] = useState('');
    const [po, setPo] = useState({ poNo: '', poDate: '' });
    const [invoiceForm, setInvoiceForm] = useState({ estimateId: '', typeOfInvoice: lead.kind === 'international' ? 'Foreign Sale' : 'Interstate Sale' });
    const [payForm, setPayForm] = useState({
        documentId: '', amount: '', paymentDate: today(), paymentType: '', paymentMode: '', referenceNo: '', bankName: '', receivedBy: '', receivedDate: today(), notes: '',
    });

    const base = `/api/buyer-leads/${lead.kind}/${lead._id}`;

    const load = async () => {
        try {
            const res = await api.get(`${base}/accounts`);
            if (res.data.success) setAccounts(res.data.data);
        } catch (error) {
            console.error('Error loading buyer accounts:', error);
        }
    };

    useEffect(() => {
        load();
    }, [lead._id]);

    const openModal = (name) => {
        setItems([{ ...EMPTY_ITEM }]);
        setRemarks('');
        setSupplyDate('');
        setPo({ poNo: '', poDate: '' });
        setModal(name);
    };

    // PI create / edit use the same page exhibitors use (/performa-invoice/:id), so a buyer PI is
    // built exactly like an exhibitor PI and takes the next number in the same series.
    const createPi = async () => {
        let eventForPi = crmEventId;
        if (!eventForPi) {
            const options = Object.fromEntries(events.map((ev) => [ev._id, ev.event_fullName || ev.event_name]));
            const picked = await Swal.fire({
                title: 'Create PI under which event?',
                input: 'select',
                inputOptions: options,
                inputPlaceholder: 'Select event',
                showCancelButton: true,
                inputValidator: (v) => (v ? undefined : 'Please select an event'),
            });
            if (!picked.isConfirmed) return;
            eventForPi = picked.value;
        }
        navigate(`/performa-invoice/${lead._id}?crmEventId=${eventForPi}`);
    };
    const openEditPi = (est) => navigate(`/performa-invoice/${lead._id}`, { state: { editEstimateId: est._id } });

    const submit = async (path, payload, successTitle) => {
        setSaving(true);
        try {
            await api.post(`${base}/${path}`, payload);
            setModal(null);
            Swal.fire({ icon: 'success', title: successTitle, timer: 1400, showConfirmButton: false });
            await load();
            onChanged?.();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || error.response?.data?.error || 'Request failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const livePIs = (accounts?.estimates || []).filter((d) => !isCancelled(d));
    const liveInvoices = (accounts?.invoices || []).filter((d) => !isCancelled(d));
    const payableDocs = [
        ...liveInvoices.map((d) => ({ id: d._id, label: `Invoice ${d.invoice_no} — ${money(d.finalAmount)}`, amount: d.finalAmount })),
        ...livePIs.map((d) => ({ id: d._id, label: `PI ${d.est_no} — ${money(d.finalAmount)}`, amount: d.finalAmount })),
    ];

    const eventPicker = !matchedEvent && (
        <div className="mb-3">
            <label className={labelCls}>Event *</label>
            <select className={fieldCls} value={pickedEventId} onChange={(e) => setPickedEventId(e.target.value)}>
                <option value="">Select event</option>
                {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.event_fullName || ev.event_name}</option>)}
            </select>
        </div>
    );

    const totals = accounts?.totals;
    const cancelledBadge = <span className="ml-1 rounded bg-red-50 px-1 text-[9px] font-bold text-red-600">Cancelled</span>;

    return (
        <div className="bg-white rounded-lg p-2.5" style={CARD_SHADOW}>
            <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-3 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
                <h2 className="text-[12px] font-semibold text-[#15173D] tracking-tight uppercase">Account</h2>
                <div className="flex flex-wrap gap-1.5">
                    <button onClick={createPi} className="h-6 px-3 rounded bg-[#124170] hover:bg-[#0A2643] text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-sm"><FileText size={11} /> Create PI</button>
                    <button onClick={() => openModal('invoice')} className="h-6 px-3 rounded bg-[#124170] hover:bg-[#0A2643] text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-sm"><Receipt size={11} /> Create Invoice</button>
                    <button
                        onClick={() => { setPayForm((p) => ({ ...p, documentId: payableDocs[0]?.id || '' })); openModal('payment'); }}
                        disabled={payableDocs.length === 0}
                        title={payableDocs.length === 0 ? 'Create a PI or Invoice first' : ''}
                        className="h-6 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                        <Wallet size={11} /> Payment Received
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-1.5 mb-3">
                {[
                    ['PI Total', totals?.piTotal],
                    ['Invoiced', totals?.invoiceTotal],
                    ['Received', totals?.received],
                    ['Outstanding', totals?.outstanding],
                ].map(([label, value]) => (
                    <div key={label} className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
                        <div className="text-[14px] font-bold text-[#15173D]">{money(value)}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Proforma Invoices</p>
                    {(accounts?.estimates || []).length === 0 ? <p className="text-[10px] italic text-slate-400">None yet.</p> : (accounts.estimates).map((d) => (
                        <div key={d._id} className="flex items-stretch gap-1 mb-1">
                            <button onClick={() => navigate(`/payments/estimateDetails/${d._id}`)} className="flex-1 text-left rounded border border-slate-200 px-2 py-1 hover:bg-slate-50">
                                <div className="text-[11px] font-bold text-[#093C5D]">{d.est_no}{isCancelled(d) && cancelledBadge}</div>
                                <div className="text-[10px] text-slate-500">{money(d.finalAmount)}</div>
                            </button>
                            {!isCancelled(d) && (
                                <button onClick={() => openEditPi(d)} title="Edit PI" className="rounded border border-slate-200 px-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                    <Pencil size={13} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Invoices</p>
                    {(accounts?.invoices || []).length === 0 ? <p className="text-[10px] italic text-slate-400">None yet.</p> : (accounts.invoices).map((d) => (
                        <button key={d._id} onClick={() => navigate(`/payments/invoiceDetails/${d._id}`)} className="w-full text-left rounded border border-slate-200 px-2 py-1 mb-1 hover:bg-slate-50">
                            <div className="text-[11px] font-bold text-[#093C5D]">{d.invoice_no}{isCancelled(d) && cancelledBadge}</div>
                            <div className="text-[10px] text-slate-500">{money(d.finalAmount)}{d.estimate_no ? ` · from ${d.estimate_no}` : ''}</div>
                        </button>
                    ))}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Payments Received</p>
                    {(accounts?.payments || []).length === 0 ? <p className="text-[10px] italic text-slate-400">None yet.</p> : (accounts.payments).map((p) => (
                        <a key={p._id} href={`${API_URL}/payments/${p._id}/receipt`} target="_blank" rel="noopener noreferrer" className="block rounded border border-slate-200 px-2 py-1 mb-1 hover:bg-slate-50">
                            <div className="text-[11px] font-bold text-[#0D530E]">{p.receipt_no || 'Receipt'} · {money(p.amount_text)}</div>
                            <div className="text-[10px] text-slate-500">{p.payment_date} · {p.payment_mode}{p.ex_no ? ` · ${p.ex_no}` : ''}</div>
                        </a>
                    ))}
                </div>
            </div>

            {modal === 'invoice' && (
                <Modal
                    wide
                    title="Create Invoice"
                    onClose={() => setModal(null)}
                    footer={(
                        <>
                            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded">Cancel</button>
                            <button
                                type="button"
                                disabled={saving || (!invoiceForm.estimateId && !crmEventId)}
                                onClick={() => submit('invoice', {
                                    typeOfInvoice: invoiceForm.typeOfInvoice,
                                    remarks,
                                    ...(supplyDate ? { supplyDate } : {}),
                                    ...(po.poNo.trim() ? { poNo: po.poNo.trim() } : {}),
                                    ...(po.poDate ? { poDate: po.poDate } : {}),
                                    ...(invoiceForm.estimateId ? { estimateId: invoiceForm.estimateId } : { crmEventId, items }),
                                }, 'Invoice created')}
                                className="px-4 py-2 text-xs font-bold text-white bg-[#124170] rounded disabled:opacity-50"
                            >
                                {saving ? 'Creating...' : 'Create Invoice'}
                            </button>
                        </>
                    )}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className={labelCls}>Create from PI</label>
                            <select className={fieldCls} value={invoiceForm.estimateId} onChange={(e) => setInvoiceForm((p) => ({ ...p, estimateId: e.target.value }))}>
                                <option value="">No PI — enter items below</option>
                                {livePIs.map((d) => <option key={d._id} value={d._id}>{d.est_no} — {money(d.finalAmount)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Invoice Type</label>
                            <select className={fieldCls} value={invoiceForm.typeOfInvoice} onChange={(e) => setInvoiceForm((p) => ({ ...p, typeOfInvoice: e.target.value }))}>
                                {INVOICE_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    {invoiceForm.estimateId ? (
                        <p className="text-[11px] text-slate-600">Items and amounts are copied from the selected PI. The invoice number comes from the same series as exhibitor invoices.</p>
                    ) : (
                        <>
                            {eventPicker}
                            <ItemsEditor items={items} setItems={setItems} />
                        </>
                    )}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                        <div>
                            <label className={labelCls}>Supply Date</label>
                            <input type="date" className={fieldCls} value={supplyDate} onChange={(e) => setSupplyDate(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>PO No.</label>
                            <input className={fieldCls} value={po.poNo} onChange={(e) => setPo((p) => ({ ...p, poNo: e.target.value }))} placeholder="Customer PO number" />
                        </div>
                        <div>
                            <label className={labelCls}>PO Date</label>
                            <input type="date" className={fieldCls} value={po.poDate} onChange={(e) => setPo((p) => ({ ...p, poDate: e.target.value }))} />
                        </div>
                    </div>
                    <label className={`${labelCls} mt-3`}>Remarks</label>
                    <textarea className="w-full rounded border border-slate-200 p-2 text-[11px] font-semibold" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </Modal>
            )}

            {modal === 'payment' && (
                <Modal
                    title="Payment Received"
                    onClose={() => setModal(null)}
                    footer={(
                        <>
                            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded">Cancel</button>
                            <button type="button" disabled={saving} onClick={() => submit('payment', payForm, 'Payment recorded')} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded disabled:opacity-50">
                                {saving ? 'Saving...' : 'Record Payment'}
                            </button>
                        </>
                    )}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Against *</label>
                            <select className={fieldCls} value={payForm.documentId} onChange={(e) => setPayForm((p) => ({ ...p, documentId: e.target.value }))}>
                                {payableDocs.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Amount Received (₹) *</label>
                            <input type="number" min="0" className={fieldCls} value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} />
                        </div>
                        <div>
                            <label className={labelCls}>Payment Date *</label>
                            <input type="date" className={fieldCls} value={payForm.paymentDate} onChange={(e) => setPayForm((p) => ({ ...p, paymentDate: e.target.value }))} />
                        </div>
                        <div>
                            <label className={labelCls}>Payment Mode *</label>
                            <select className={fieldCls} value={payForm.paymentMode} onChange={(e) => setPayForm((p) => ({ ...p, paymentMode: e.target.value }))}>
                                <option value="">Select mode</option>
                                {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Payment Type *</label>
                            <select className={fieldCls} value={payForm.paymentType} onChange={(e) => setPayForm((p) => ({ ...p, paymentType: e.target.value }))}>
                                <option value="">Select type</option>
                                {PAYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        {payForm.paymentMode === 'Cash' ? (
                            <>
                                <div>
                                    <label className={labelCls}>Received By *</label>
                                    <input className={fieldCls} value={payForm.receivedBy} onChange={(e) => setPayForm((p) => ({ ...p, receivedBy: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>Received Date *</label>
                                    <input type="date" className={fieldCls} value={payForm.receivedDate} onChange={(e) => setPayForm((p) => ({ ...p, receivedDate: e.target.value }))} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className={labelCls}>Reference / UTR No.</label>
                                    <input className={fieldCls} value={payForm.referenceNo} onChange={(e) => setPayForm((p) => ({ ...p, referenceNo: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>Bank</label>
                                    <input className={fieldCls} value={payForm.bankName} onChange={(e) => setPayForm((p) => ({ ...p, bankName: e.target.value }))} />
                                </div>
                            </>
                        )}
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Internal Remarks</label>
                            <textarea className="w-full rounded border border-slate-200 p-2 text-[11px] font-semibold" rows={2} value={payForm.notes} onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))} />
                        </div>
                    </div>
                    <p className="mt-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-[11px] font-semibold text-green-800">
                        Once a payment is recorded, this buyer moves to Converted.
                    </p>
                </Modal>
            )}
        </div>
    );
};

export default BuyerAccountsPanel;
