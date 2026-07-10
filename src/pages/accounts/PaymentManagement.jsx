import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from '../../lib/api';
import { Save, Eye, Plus, Trash2, Image as ImageIcon, Building2, Palette, Tags, List, Ruler, Info, GripVertical } from 'lucide-react';

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

const Section = ({ icon: Icon, title, children, action }) => (
    <section className="rounded-lg border border-[#dbe4ef] bg-white px-5 py-4 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e9f7ec] text-[#14752f]">
                    <Icon size={18} strokeWidth={2.1} />
                </span>
                <h2 className="text-[19px] font-bold text-[#17213d]">{title}</h2>
            </div>
            {action}
        </div>
        {children}
    </section>
);

const ColorField = ({ label, name, value, onChange }) => (
    <div>
        <label className="mb-2 block text-[13px] font-semibold text-[#17213d]">{label}</label>
        <div className="flex h-11 overflow-hidden rounded-md border border-[#cfd9e6] bg-white">
            <div className="flex w-14 items-center justify-center border-r border-[#dfe6ef] bg-white">
                <input type="color" name={name} value={value} onChange={onChange} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0" />
            </div>
            <input type="text" name={name} value={value} onChange={onChange} className="min-w-0 flex-1 px-3 text-[14px] font-medium text-[#17213d] outline-none" />
        </div>
    </div>
);

const TextField = ({ label, name, value, onChange, textarea }) => (
    <div>
        <label className="mb-2 block text-[13px] font-semibold text-[#17213d]">{label}</label>
        {textarea ? (
            <textarea name={name} value={value} onChange={onChange} rows={3} className="min-h-[92px] w-full rounded-md border border-[#cfd9e6] bg-white px-4 py-3 text-[15px] font-medium leading-6 text-[#17213d] outline-none transition focus:border-[#1a7a3c] focus:ring-2 focus:ring-[#1a7a3c]/10" />
        ) : (
            <input type="text" name={name} value={value} onChange={onChange} className="h-12 w-full rounded-md border border-[#cfd9e6] bg-white px-4 text-[15px] font-medium text-[#17213d] outline-none transition focus:border-[#1a7a3c] focus:ring-2 focus:ring-[#1a7a3c]/10" />
        )}
    </div>
);

const NumberField = ({ label, name, value, onChange, min, max }) => (
    <div>
        <label className="mb-2 block text-[12px] font-semibold text-[#17213d]">{label} (pt)</label>
        <div className="flex h-10 overflow-hidden rounded-md border border-[#cfd9e6] bg-white">
            <input type="number" name={name} min={min} max={max} value={value} onChange={onChange} className="min-w-0 flex-1 px-3 text-[14px] font-medium text-[#17213d] outline-none" />
            <span className="flex w-10 items-center justify-center border-l border-[#dfe6ef] bg-[#f8fafc] text-[13px] font-semibold text-[#17213d]">pt</span>
        </div>
    </div>
);

const LogoUpload = ({ label, preview, onChange, alt, helper }) => (
    <div>
        <label className="mb-1 block text-[13px] font-semibold text-[#17213d]">{label}</label>
        <div className="flex h-[58px] items-center gap-5 rounded-md border border-[#dbe4ef] bg-white px-3">
            <div className="flex h-11 w-32 items-center justify-center overflow-hidden rounded border border-[#e1e8f0] bg-[#f8fafc]">
                {preview ? (
                    <img loading="lazy" decoding="async" src={preview} alt={alt} className="max-h-full max-w-full object-contain" />
                ) : (
                    <ImageIcon size={20} className="text-[#9aa8ba]" />
                )}
            </div>
            <input type="file" accept="image/*" onChange={onChange} className="text-[13px] font-medium text-[#17213d] file:mr-4 file:rounded-md file:border file:border-[#cfd9e6] file:bg-white file:px-4 file:py-2 file:text-[13px] file:font-medium file:text-[#17213d] hover:file:bg-[#f8fafc]" />
        </div>
        <p className="mt-2 max-w-[620px] text-[13px] font-medium leading-5 text-[#7b88a1]">{helper}</p>
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
        <div className="min-h-screen bg-[#f8fafc] p-5 text-[#17213d]">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-1 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#17213d]">Payment Receipt Settings</h1>
                        <p className="mt-1 text-[12px] font-medium text-[#7b88a1]">Customize the appearance and content of your payment receipts</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={handlePreview}
                            disabled={isPreviewing}
                            className="flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-md border border-[#178337] bg-white px-5 text-[14px] font-bold text-[#087224] shadow-sm transition hover:bg-[#f0fbf3] disabled:opacity-50"
                        >
                            <Eye size={17} /> {isPreviewing ? 'Generating...' : 'Preview Receipt'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-md bg-[#0c7f24] px-5 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#096a1d] disabled:opacity-50"
                        >
                            <Save size={17} /> Save Settings
                        </button>
                    </div>
                </div>

                {companyInfo && (
                    <div className="mb-1 rounded-lg border border-[#dbe4ef] border-l-[4px] border-l-[#1a7a3c] bg-white px-5 py-6 shadow-sm">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-[80px_1fr_1fr] md:items-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f6e9] text-[#14752f] md:mx-auto">
                                <Building2 size={32} strokeWidth={1.8} />
                            </div>
                            <div>
                                <h2 className="mb-1 text-[15px] font-bold text-[#17213d]">Company Info (from Settings - edit under Settings &gt; Company)</h2>
                                <div className="space-y-3 text-[13px] font-medium text-[#17213d]">
                                    <div><span className="font-extrabold">Name:</span> <span className="ml-1">{companyInfo.companyName || 'N/A'}</span></div>
                                    <div><span className="font-extrabold">Address:</span> <span className="ml-1">{companyInfo.companyAddress || 'N/A'}</span></div>
                                </div>
                            </div>
                            <div className="space-y-3 text-[13px] font-medium text-[#17213d] md:pt-1">
                                <div><span className="font-extrabold">GSTIN:</span> <span className="ml-1">{companyInfo.companyGst || 'N/A'}</span></div>
                                <div><span className="font-extrabold">CIN:</span> <span className="ml-1">{companyInfo.companyCin || 'N/A'}</span></div>
                                <div><span className="font-extrabold">Email:</span> <span className="ml-1">{companyInfo.contactEmail || 'N/A'}</span></div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <Section icon={Palette} title="Band Colors">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            <ColorField label="Organiser Band (FROM)" name="organiserBandColor" value={formData.organiserBandColor} onChange={handleChange} />
                            <ColorField label="Exhibitor Band (TO)" name="exhibitorBandColor" value={formData.exhibitorBandColor} onChange={handleChange} />
                            <ColorField label="Accent (headers/tables/footer bar)" name="accentColor" value={formData.accentColor} onChange={handleChange} />
                            <ColorField label="Important Note Band" name="noteColor" value={formData.noteColor} onChange={handleChange} />
                        </div>
                    </Section>

                    <Section icon={Tags} title="Labels">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-3">
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
                        <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <TextField label="Footer Thank-You Text" name="footerThankYouText" value={formData.footerThankYouText} onChange={handleChange} textarea />
                            <TextField label="Footer Disclaimer Text" name="footerDisclaimerText" value={formData.footerDisclaimerText} onChange={handleChange} textarea />
                        </div>
                    </Section>

                    <Section
                        icon={List}
                        title="Important Note - Bullet Points"
                        action={
                            <button onClick={addNoteItem} className="flex h-10 items-center gap-2 rounded-md border border-[#178337] bg-white px-4 text-[13px] font-bold text-[#087224] transition hover:bg-[#f0fbf3]">
                                <Plus size={16} /> Add Point
                            </button>
                        }
                    >
                        <div className="space-y-4">
                            {formData.importantNoteItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-[22px_28px_1fr_28px] items-center gap-4">
                                    <GripVertical size={17} className="text-[#9aa8ba]" />
                                    <span className="text-[15px] font-bold text-[#17213d]">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleNoteItemChange(index, e.target.value)}
                                        className="h-12 rounded-md border border-[#dbe4ef] bg-white px-5 text-[14px] font-medium text-[#17213d] outline-none transition focus:border-[#1a7a3c] focus:ring-2 focus:ring-[#1a7a3c]/10"
                                    />
                                    <button onClick={() => removeNoteItem(index)} className="flex h-8 w-8 items-center justify-center rounded text-red-500 transition hover:bg-red-50 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {formData.importantNoteItems.length === 0 && (
                                <p className="text-[13px] font-medium text-[#7b88a1]">No bullet points yet - click "Add Point".</p>
                            )}
                        </div>
                    </Section>

                    <Section icon={ImageIcon} title="Logos">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <LogoUpload
                                label="Header Image (full top banner)"
                                preview={headerLogoPreview}
                                onChange={handleHeaderLogoChange}
                                alt="Header banner"
                                helper="Replaces the entire top strip (wordmark, contact info, GSTIN/CIN, Head Office) with this one image. Leave empty to use the field-driven header (company info from Settings) instead."
                            />
                            <LogoUpload
                                label="Event Logo (receipt's event banner)"
                                preview={eventLogoPreview}
                                onChange={handleEventLogoChange}
                                alt="Event logo"
                                helper="Falls back to plain event-name text if none is uploaded."
                            />
                        </div>
                    </Section>

                    <Section icon={Ruler} title="Band Height, Gaps & Page Margin">
                        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
                            <NumberField label="Header Band" name="headerBandHeight" value={formData.headerBandHeight} onChange={handleChange} min={70} max={140} />
                            <NumberField label="Event Band" name="eventBandHeight" value={formData.eventBandHeight} onChange={handleChange} min={60} max={120} />
                            <NumberField label="From/To Band" name="infoBandHeight" value={formData.infoBandHeight} onChange={handleChange} min={80} max={160} />
                            <NumberField label="Footer Band" name="footerBandHeight" value={formData.footerBandHeight} onChange={handleChange} min={60} max={110} />
                            <NumberField label="Page Side Margin" name="pageMarginX" value={formData.pageMarginX} onChange={handleChange} min={15} max={50} />
                            <NumberField label="Gap Between Sections" name="sectionGap" value={formData.sectionGap} onChange={handleChange} min={0} max={30} />
                        </div>
                        <div className="mt-4 flex gap-3 text-[13px] font-medium leading-5 text-[#7b88a1]">
                            <Info size={20} className="mt-0.5 shrink-0 text-[#1687d9]" />
                            <p>Values are clamped server-side to a safe range so the receipt always fits on a single A4 page. "Gap Between Sections" controls the whitespace between each block (header, event, from/to, invoice details, payment details, exhibitor/note, footer).</p>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagement;
