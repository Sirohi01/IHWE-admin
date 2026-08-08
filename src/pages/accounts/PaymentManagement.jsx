import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from '../../lib/api';
import { Save, Eye, Image as ImageIcon, Building2, Palette, Tags, Ruler, Info } from 'lucide-react';

const EMPTY_FORM = {
    organiserBandColor: '#0b3974',
    exhibitorBandColor: '#1a7a3c',
    accentColor: '#0b3974',
    noteColor: '#c2410c',
    sectionBandColor: '#94a3b8',
    sectionBandTextColor: '#ffffff',
    authBandColor: '#94a3b8',
    authBandTextColor: '#0b3974',
    footerBarColor: '#0b3974',
    footerBarTextColor: '#ffffff',
    receiptTitleBandColor: '#ffffff',
    headOfficeLabel: 'Head Office:',
    receiptTitleLabel: 'PAYMENT RECEIPT',
    fromLabel: 'FROM (ORGANISER)',
    toLabel: 'TO (EXHIBITOR)',
    invoiceDetailsLabel: 'INVOICE DETAILS',
    paymentDetailsLabel: 'PAYMENT DETAILS',
    footerThankYouText: '',
    footerDisclaimerText: '',
    receiptNumberPrefix: 'PAY-RCPT-',
    headerBandHeight: 95,
    eventBandHeight: 85,
    infoBandHeight: 115,
    footerBandHeight: 85,
    pageMarginX: 30,
    sectionGap: 8,
    showSignatureStamp: false,
    signatureLabel: 'Authorized Signatory',
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

const LogoUpload = ({ label, preview, onChange, onRemove, alt, helper }) => (
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
            <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={onChange} className="text-[13px] font-medium text-[#17213d] file:mr-4 file:rounded-md file:border file:border-[#cfd9e6] file:bg-white file:px-4 file:py-2 file:text-[13px] file:font-medium file:text-[#17213d] hover:file:bg-[#f8fafc]" />
                {preview && onRemove && (
                    <button type="button" onClick={onRemove} className="text-[13px] font-semibold text-red-500 transition hover:text-red-700">
                        Remove
                    </button>
                )}
            </div>
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
    const [stampFile, setStampFile] = useState(null);
    const [stampPreview, setStampPreview] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);
    
    // Deletion flags
    const [removeEventLogo, setRemoveEventLogo] = useState(false);
    const [removeHeaderLogo, setRemoveHeaderLogo] = useState(false);
    const [removeStamp, setRemoveStamp] = useState(false);
    const [removeSignature, setRemoveSignature] = useState(false);

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
                    sectionBandColor: d.sectionBandColor || EMPTY_FORM.sectionBandColor,
                    sectionBandTextColor: d.sectionBandTextColor || EMPTY_FORM.sectionBandTextColor,
                    authBandColor: d.authBandColor || EMPTY_FORM.authBandColor,
                    authBandTextColor: d.authBandTextColor || EMPTY_FORM.authBandTextColor,
                    footerBarColor: d.footerBarColor || EMPTY_FORM.footerBarColor,
                    footerBarTextColor: d.footerBarTextColor || EMPTY_FORM.footerBarTextColor,
                    receiptTitleBandColor: d.receiptTitleBandColor || EMPTY_FORM.receiptTitleBandColor,
                    headOfficeLabel: d.headOfficeLabel || '',
                    receiptTitleLabel: d.receiptTitleLabel || '',
                    fromLabel: d.fromLabel || '',
                    toLabel: d.toLabel || '',
                    invoiceDetailsLabel: d.invoiceDetailsLabel || '',
                    paymentDetailsLabel: d.paymentDetailsLabel || '',
                    footerThankYouText: d.footerThankYouText || '',
                    footerDisclaimerText: d.footerDisclaimerText || '',
                    receiptNumberPrefix: d.receiptNumberPrefix || '',
                    headerBandHeight: d.headerBandHeight ?? EMPTY_FORM.headerBandHeight,
                    eventBandHeight: d.eventBandHeight ?? EMPTY_FORM.eventBandHeight,
                    infoBandHeight: d.infoBandHeight ?? EMPTY_FORM.infoBandHeight,
                    footerBandHeight: d.footerBandHeight ?? EMPTY_FORM.footerBandHeight,
                    pageMarginX: d.pageMarginX ?? EMPTY_FORM.pageMarginX,
                    sectionGap: d.sectionGap ?? EMPTY_FORM.sectionGap,
                    showSignatureStamp: d.showSignatureStamp ?? false,
                    signatureLabel: d.signatureLabel ?? 'Authorized Signatory',
                });
                setEventLogoPreview(mediaUrl(d.eventLogoImage));
                setHeaderLogoPreview(mediaUrl(d.headerLogoImage));
                setStampPreview(mediaUrl(d.stampImage));
                setSignaturePreview(mediaUrl(d.signatureImage));
                // Reset flags on fetch
                setRemoveEventLogo(false);
                setRemoveHeaderLogo(false);
                setRemoveStamp(false);
                setRemoveSignature(false);
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
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleEventLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEventLogoFile(file);
        setEventLogoPreview(URL.createObjectURL(file));
        setRemoveEventLogo(false);
    };

    const handleHeaderLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setHeaderLogoFile(file);
        setHeaderLogoPreview(URL.createObjectURL(file));
        setRemoveHeaderLogo(false);
    };

    const handleStampChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setStampFile(file);
        setStampPreview(URL.createObjectURL(file));
        setRemoveStamp(false);
    };

    const handleSignatureChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSignatureFile(file);
        setSignaturePreview(URL.createObjectURL(file));
        setRemoveSignature(false);
    };

    const handleRemoveEventLogo = () => { setEventLogoFile(null); setEventLogoPreview(null); setRemoveEventLogo(true); };
    const handleRemoveHeaderLogo = () => { setHeaderLogoFile(null); setHeaderLogoPreview(null); setRemoveHeaderLogo(true); };
    const handleRemoveStamp = () => { setStampFile(null); setStampPreview(null); setRemoveStamp(true); };
    const handleRemoveSignature = () => { setSignatureFile(null); setSignaturePreview(null); setRemoveSignature(true); };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value);
            });
            if (eventLogoFile) payload.append('eventLogoImage', eventLogoFile);
            if (headerLogoFile) payload.append('headerLogoImage', headerLogoFile);
            if (stampFile) payload.append('stampImage', stampFile);
            if (signatureFile) payload.append('signatureImage', signatureFile);

            if (removeEventLogo) payload.append('removeEventLogo', 'true');
            if (removeHeaderLogo) payload.append('removeHeaderLogo', 'true');
            if (removeStamp) payload.append('removeStamp', 'true');
            if (removeSignature) payload.append('removeSignature', 'true');

            await api.put('/api/payment-receipt-settings', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Swal.fire({ icon: 'success', title: 'Payment Receipt settings updated!', timer: 1500, showConfirmButton: false });
            setEventLogoFile(null);
            setHeaderLogoFile(null);
            setStampFile(null);
            setSignatureFile(null);
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
            const res = await api.get(`/api/payment-receipt-settings/preview?t=${Date.now()}`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
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
                                <div style={{ marginTop: 4 }}><span className="font-extrabold">GSTIN:</span> <span className="ml-1">{companyInfo.companyGst || 'N/A'}</span></div>
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
                            <ColorField label="Footer Thank-You Text" name="noteColor" value={formData.noteColor} onChange={handleChange} />
                            <ColorField label="Divider Bands (Payment Against.../Received Payment Details)" name="sectionBandColor" value={formData.sectionBandColor} onChange={handleChange} />
                            <ColorField label="Divider Bands Text" name="sectionBandTextColor" value={formData.sectionBandTextColor} onChange={handleChange} />
                            <ColorField label="Prepared/Reviewed By Header Band" name="authBandColor" value={formData.authBandColor} onChange={handleChange} />
                            <ColorField label="Prepared/Reviewed By Header Text" name="authBandTextColor" value={formData.authBandTextColor} onChange={handleChange} />
                            <ColorField label="Bottom Disclaimer Bar" name="footerBarColor" value={formData.footerBarColor} onChange={handleChange} />
                            <ColorField label="Bottom Disclaimer Bar Text" name="footerBarTextColor" value={formData.footerBarTextColor} onChange={handleChange} />
                            <ColorField label="Payment Receipt Title Band (leave white for none)" name="receiptTitleBandColor" value={formData.receiptTitleBandColor} onChange={handleChange} />
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
                        </div>
                        <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <TextField label="Footer Thank-You Text" name="footerThankYouText" value={formData.footerThankYouText} onChange={handleChange} textarea />
                            <TextField label="Footer Disclaimer Text" name="footerDisclaimerText" value={formData.footerDisclaimerText} onChange={handleChange} textarea />
                        </div>
                    </Section>

                    <Section icon={ImageIcon} title="Logos">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <LogoUpload
                                label="Header Image (full top banner)"
                                preview={headerLogoPreview}
                                onChange={handleHeaderLogoChange}
                                onRemove={handleRemoveHeaderLogo}
                                alt="Header banner"
                                helper="Replaces the entire top strip (wordmark, contact info, GSTIN/CIN, Head Office) with this one image. Leave empty to use the field-driven header (company info from Settings) instead."
                            />
                            <LogoUpload
                                label="Event Logo (receipt's event banner)"
                                preview={eventLogoPreview}
                                onChange={handleEventLogoChange}
                                onRemove={handleRemoveEventLogo}
                                alt="Event logo"
                                helper="Falls back to plain event-name text if none is uploaded."
                            />
                        </div>
                    </Section>

                    <Section icon={ImageIcon} title="Signature & Stamp">
                        <div className="mb-8 flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="showSignatureStamp"
                                checked={formData.showSignatureStamp}
                                onChange={handleChange}
                                id="showSignatureStamp"
                                className="h-5 w-5 cursor-pointer accent-[#1a7a3c]"
                            />
                            <label htmlFor="showSignatureStamp" className="cursor-pointer text-[15px] font-semibold text-[#17213d]">
                                Enable Digital Signature & Stamp
                            </label>
                        </div>
                        {formData.showSignatureStamp && (
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <TextField label="Signature Label (e.g. Authorized Signatory)" name="signatureLabel" value={formData.signatureLabel} onChange={handleChange} />
                                <div className="hidden md:block" />
                                <LogoUpload
                                    label="Company Stamp Image"
                                    preview={stampPreview}
                                    onChange={handleStampChange}
                                    onRemove={handleRemoveStamp}
                                    alt="Stamp logo"
                                    helper="Appears faded behind the signature on the receipt."
                                />
                                <LogoUpload
                                    label="Signature Image"
                                    preview={signaturePreview}
                                    onChange={handleSignatureChange}
                                    onRemove={handleRemoveSignature}
                                    alt="Signature logo"
                                    helper="Upload a transparent PNG signature."
                                />
                            </div>
                        )}
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
                            <p>Values are clamped server-side to a safe range so the receipt always fits on a single A4 page. "Gap Between Sections" controls the whitespace between each block (header, event, from/to, invoice details, payment details, signature block, footer).</p>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagement;
