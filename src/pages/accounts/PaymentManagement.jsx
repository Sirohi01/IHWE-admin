import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from '../../lib/api';
import { Save, Eye, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const EMPTY_FORM = {
    organiserBandColor: '#0b3974',
    exhibitorBandColor: '#1a7a3c',
    accentColor: '#0b3974',
    noteColor: '#c2410c',
    headOfficeLabel: 'Head Office:',
    receiptTitleLabel: 'PAYMENT RECEIPT',
    fromLabel: 'FROM (ORGANISER)',
    toLabel: 'TO (EXHIBITOR)',
    invoiceDetailsLabel: 'INVOICE DETAILS',
    paymentDetailsLabel: 'PAYMENT DETAILS',
    exhibitorDetailsLabel: 'EXHIBITOR DETAILS',
    importantNoteLabel: 'IMPORTANT NOTE',
    footerThankYouText: '',
    footerDisclaimerText: '',
    receiptNumberPrefix: 'PAY-RCPT-',
    importantNoteItems: [],
    headerBandHeight: 95,
    eventBandHeight: 85,
    infoBandHeight: 115,
    footerBandHeight: 85,
    pageMarginX: 30,
    sectionGap: 8,
};

const mediaUrl = (value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `${SERVER_URL}${value.startsWith('/') ? '' : '/'}${value}`;
};

const ColorField = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
        <div className="flex items-center gap-2">
            <input type="color" name={name} value={value} onChange={onChange} className="w-12 h-9 p-1 border-2 border-slate-200 rounded cursor-pointer" />
            <input type="text" name={name} value={value} onChange={onChange} className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
        </div>
    </div>
);

const TextField = ({ label, name, value, onChange, textarea }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
        {textarea ? (
            <textarea name={name} value={value} onChange={onChange} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        ) : (
            <input type="text" name={name} value={value} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        )}
    </div>
);

const NumberField = ({ label, name, value, onChange, min, max }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{label} (pt)</label>
        <input type="number" name={name} min={min} max={max} value={value} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
    </div>
);

const PaymentManagement = () => {
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [companyInfo, setCompanyInfo] = useState(null);
    const [eventLogoFile, setEventLogoFile] = useState(null);
    const [eventLogoPreview, setEventLogoPreview] = useState(null);
    const [headerLogoFile, setHeaderLogoFile] = useState(null);
    const [headerLogoPreview, setHeaderLogoPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [receiptRes, settingsRes] = await Promise.all([
                api.get('/api/payment-receipt-settings'),
                api.get('/api/settings'),
            ]);
            if (receiptRes.data?.success) {
                const d = receiptRes.data.data;
                setFormData({
                    organiserBandColor: d.organiserBandColor || EMPTY_FORM.organiserBandColor,
                    exhibitorBandColor: d.exhibitorBandColor || EMPTY_FORM.exhibitorBandColor,
                    accentColor: d.accentColor || EMPTY_FORM.accentColor,
                    noteColor: d.noteColor || EMPTY_FORM.noteColor,
                    headOfficeLabel: d.headOfficeLabel || '',
                    receiptTitleLabel: d.receiptTitleLabel || '',
                    fromLabel: d.fromLabel || '',
                    toLabel: d.toLabel || '',
                    invoiceDetailsLabel: d.invoiceDetailsLabel || '',
                    paymentDetailsLabel: d.paymentDetailsLabel || '',
                    exhibitorDetailsLabel: d.exhibitorDetailsLabel || '',
                    importantNoteLabel: d.importantNoteLabel || '',
                    footerThankYouText: d.footerThankYouText || '',
                    footerDisclaimerText: d.footerDisclaimerText || '',
                    receiptNumberPrefix: d.receiptNumberPrefix || '',
                    importantNoteItems: Array.isArray(d.importantNoteItems) ? d.importantNoteItems : [],
                    headerBandHeight: d.headerBandHeight ?? EMPTY_FORM.headerBandHeight,
                    eventBandHeight: d.eventBandHeight ?? EMPTY_FORM.eventBandHeight,
                    infoBandHeight: d.infoBandHeight ?? EMPTY_FORM.infoBandHeight,
                    footerBandHeight: d.footerBandHeight ?? EMPTY_FORM.footerBandHeight,
                    pageMarginX: d.pageMarginX ?? EMPTY_FORM.pageMarginX,
                    sectionGap: d.sectionGap ?? EMPTY_FORM.sectionGap,
                });
                setEventLogoPreview(mediaUrl(d.eventLogoImage));
                setHeaderLogoPreview(mediaUrl(d.headerLogoImage));
            }
            if (settingsRes.data?.success) {
                setCompanyInfo(settingsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching payment receipt settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNoteItemChange = (index, value) => {
        setFormData((prev) => {
            const items = [...prev.importantNoteItems];
            items[index] = value;
            return { ...prev, importantNoteItems: items };
        });
    };

    const addNoteItem = () => {
        setFormData((prev) => ({ ...prev, importantNoteItems: [...prev.importantNoteItems, ''] }));
    };

    const removeNoteItem = (index) => {
        setFormData((prev) => ({ ...prev, importantNoteItems: prev.importantNoteItems.filter((_, i) => i !== index) }));
    };

    const handleEventLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEventLogoFile(file);
        setEventLogoPreview(URL.createObjectURL(file));
    };

    const handleHeaderLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setHeaderLogoFile(file);
        setHeaderLogoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'importantNoteItems') {
                    payload.append(key, JSON.stringify(value));
                } else {
                    payload.append(key, value);
                }
            });
            if (eventLogoFile) payload.append('eventLogoImage', eventLogoFile);
            if (headerLogoFile) payload.append('headerLogoImage', headerLogoFile);

            await api.put('/api/payment-receipt-settings', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Swal.fire({ icon: 'success', title: 'Payment Receipt settings updated!', timer: 1500, showConfirmButton: false });
            setEventLogoFile(null);
            setHeaderLogoFile(null);
            fetchData();
        } catch (error) {
            console.error('Error saving payment receipt settings:', error);
            Swal.fire('Error', 'Failed to save payment receipt settings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreview = async () => {
        setIsPreviewing(true);
        try {
            const res = await api.get('/api/payment-receipt-settings/preview', { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error generating preview:', error);
            Swal.fire('Error', 'Failed to generate preview', 'error');
        } finally {
            setIsPreviewing(false);
        }
    };

    return (
        <div className="bg-white shadow-md p-6 min-h-screen">
            <PageHeader
                title="Payment Management"
                description="Customize how the Payment Receipt PDF looks — labels, band colors, logo and section sizing."
            >
                <button
                    onClick={handlePreview}
                    disabled={isPreviewing}
                    className="flex items-center gap-2 bg-[#0b3974] text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-[#0b3974]/90 disabled:opacity-50"
                >
                    <Eye size={15} /> {isPreviewing ? 'Generating...' : 'Preview'}
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[#23471d] text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-[#23471d]/90 disabled:opacity-50"
                >
                    <Save size={15} /> Save Changes
                </button>
            </PageHeader>

            {/* Read-only company info, sourced from Settings */}
            {companyInfo && (
                <div className="mt-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Company Info (from Settings — edit under Settings &gt; Company)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                        <div><span className="font-semibold">Name:</span> {companyInfo.companyName || 'N/A'}</div>
                        <div><span className="font-semibold">GSTIN:</span> {companyInfo.companyGst || 'N/A'}</div>
                        <div><span className="font-semibold">CIN:</span> {companyInfo.companyCin || 'N/A'}</div>
                        <div><span className="font-semibold">Email:</span> {companyInfo.contactEmail || 'N/A'}</div>
                        <div className="col-span-2 md:col-span-4"><span className="font-semibold">Address:</span> {companyInfo.companyAddress || 'N/A'}</div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {/* Colors */}
                <section>
                    <h2 className="text-lg font-semibold text-[#23471d] mb-3">Band Colors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ColorField label="Organiser Band (FROM)" name="organiserBandColor" value={formData.organiserBandColor} onChange={handleChange} />
                        <ColorField label="Exhibitor Band (TO)" name="exhibitorBandColor" value={formData.exhibitorBandColor} onChange={handleChange} />
                        <ColorField label="Accent (headers/tables/footer bar)" name="accentColor" value={formData.accentColor} onChange={handleChange} />
                        <ColorField label="Important Note Band" name="noteColor" value={formData.noteColor} onChange={handleChange} />
                    </div>
                </section>

                {/* Labels */}
                <section>
                    <h2 className="text-lg font-semibold text-[#23471d] mb-3">Labels</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <TextField label="Head Office Label" name="headOfficeLabel" value={formData.headOfficeLabel} onChange={handleChange} />
                        <TextField label="Receipt Title" name="receiptTitleLabel" value={formData.receiptTitleLabel} onChange={handleChange} />
                        <TextField label="Receipt Number Prefix" name="receiptNumberPrefix" value={formData.receiptNumberPrefix} onChange={handleChange} />
                        <TextField label="FROM Box Label" name="fromLabel" value={formData.fromLabel} onChange={handleChange} />
                        <TextField label="TO Box Label" name="toLabel" value={formData.toLabel} onChange={handleChange} />
                        <TextField label="Invoice Details Label" name="invoiceDetailsLabel" value={formData.invoiceDetailsLabel} onChange={handleChange} />
                        <TextField label="Payment Details Label" name="paymentDetailsLabel" value={formData.paymentDetailsLabel} onChange={handleChange} />
                        <TextField label="Exhibitor Details Label" name="exhibitorDetailsLabel" value={formData.exhibitorDetailsLabel} onChange={handleChange} />
                        <TextField label="Important Note Label" name="importantNoteLabel" value={formData.importantNoteLabel} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <TextField label="Footer Thank-You Text" name="footerThankYouText" value={formData.footerThankYouText} onChange={handleChange} textarea />
                        <TextField label="Footer Disclaimer Text" name="footerDisclaimerText" value={formData.footerDisclaimerText} onChange={handleChange} textarea />
                    </div>
                </section>

                {/* Important Note Items */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-[#23471d]">Important Note — Bullet Points</h2>
                        <button onClick={addNoteItem} className="flex items-center gap-1 text-xs font-semibold text-[#23471d] border border-[#23471d] rounded-md px-3 py-1.5 hover:bg-[#23471d] hover:text-white transition-colors">
                            <Plus size={14} /> Add Point
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.importantNoteItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-400 w-5">{index + 1}.</span>
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleNoteItemChange(index, e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                                <button onClick={() => removeNoteItem(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {formData.importantNoteItems.length === 0 && (
                            <p className="text-xs text-gray-400">No bullet points yet — click "Add Point".</p>
                        )}
                    </div>
                </section>

                {/* Logos */}
                <section>
                    <h2 className="text-lg font-semibold text-[#23471d] mb-3">Logos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Header Image (full top banner)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                                    {headerLogoPreview ? (
                                        <img src={headerLogoPreview} alt="Header banner" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <ImageIcon size={24} className="text-gray-300" />
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleHeaderLogoChange} className="text-sm" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Replaces the entire top strip (wordmark, contact info, GSTIN/CIN, Head Office) with this one image. Leave empty to use the field-driven header (company info from Settings) instead.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Event Logo (receipt's event banner)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                                    {eventLogoPreview ? (
                                        <img src={eventLogoPreview} alt="Event logo" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <ImageIcon size={24} className="text-gray-300" />
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleEventLogoChange} className="text-sm" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Falls back to plain event-name text if none is uploaded.</p>
                        </div>
                    </div>
                </section>

                {/* Band Sizing */}
                <section>
                    <h2 className="text-lg font-semibold text-[#23471d] mb-3">Band Height, Gaps &amp; Page Margin</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <NumberField label="Header Band" name="headerBandHeight" value={formData.headerBandHeight} onChange={handleChange} min={70} max={140} />
                        <NumberField label="Event Band" name="eventBandHeight" value={formData.eventBandHeight} onChange={handleChange} min={60} max={120} />
                        <NumberField label="From/To Band" name="infoBandHeight" value={formData.infoBandHeight} onChange={handleChange} min={80} max={160} />
                        <NumberField label="Footer Band" name="footerBandHeight" value={formData.footerBandHeight} onChange={handleChange} min={60} max={110} />
                        <NumberField label="Page Side Margin" name="pageMarginX" value={formData.pageMarginX} onChange={handleChange} min={15} max={50} />
                        <NumberField label="Gap Between Sections" name="sectionGap" value={formData.sectionGap} onChange={handleChange} min={0} max={30} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Values are clamped server-side to a safe range so the receipt always fits on a single A4 page. "Gap Between Sections" controls the whitespace between each block (header, event, from/to, invoice details, payment details, exhibitor/note, footer).</p>
                </section>
            </div>
        </div>
    );
};

export default PaymentManagement;
