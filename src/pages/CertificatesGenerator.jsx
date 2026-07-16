import React, { useEffect, useState } from 'react';
import Certi from '../components/certificates/Certi';
import api, { SERVER_URL } from '../lib/api';

import certificateHeading from "../assets/certificates/Certificate/Certificate Participation copy.png";
import msmeSupportedBy from "../assets/certificates/Certificate/MSME.png";
import namoGangeLogo from "../assets/certificates/Certificate/NGT Logo.png";
import eventLogo from "../assets/certificates/Certificate/ags logo.png";
import founderSignature from "../assets/certificates/Certificate/Acharya ji.png";
import chairmanSignature from "../assets/certificates/Certificate/Vijay sir.png";
import globalAwardLogo from "../assets/certificates/Certificate/Global Award.png";

const defaultSeed = {
    supportedByText: "SUPPORTED BY:",
    presentsText: "Presents",
    bodyTextPart1: "This is to certify that",
    recipientName: "DABUR INDIA LIMITED",
    bodyTextPart2: "has actively participated in the 18th",
    highlightText1: "Arogya Sangosthi",
    bodyTextPart3: "Seminar & 9th Edition of",
    highlightText2: "International Health & Wellness",
    highlightText3: "Expo 2026",
    bodyTextPart4: ", organised by Namo Gange Trust, held from 21st August to 23rd August 2026",
    bodyTextPart5: "at Pragati Maidan, New Delhi, Bharat.",
    bodyTextPart6: "Your valuable contributions and active engagement during the seminar have greatly",
    bodyTextPart7: "enriched the discussions on healthcare and wellness.",
    bodyTextPart8: "We, at Namo Gange Trust, appreciate your dedication and wish you continued success",
    bodyTextPart9: "in your future endeavours.",
    founderName: "H.H. Shri Acharya Jagdish Ji",
    founderRole: "Founder",
    chairmanName: "Shri Vijay Sharma",
    chairmanRole: "Chairman",
    initiativesTitle: "Namo Gange Trust Initiatives",
    concurrentTitle: "CONCURRENT EVENTS",
    footerAddress: "Head Office: 12/52, Site-II, Loni Road Industrial Area, Mohan Nagar, Ghaziabad 201007, UP, Bharat",
    footerContact: "info@namogange.org | web: www.namogange.org"
};

const defaultImages = {
    supportedByLogo: msmeSupportedBy,
    mainLogo: namoGangeLogo,
    titleLogo: eventLogo,
    certificateHeading,
    founderSignature,
    chairmanSignature,
    globalAwardLogo
};

const imageLabels = {
    supportedByLogo: 'Supported By Logo',
    mainLogo: 'Namo Gange Logo',
    titleLogo: 'Event Title Logo',
    certificateHeading: 'Certificate Heading',
    founderSignature: 'Founder Signature',
    chairmanSignature: 'Chairman Signature',
    globalAwardLogo: 'Global Award Logo'
};

const resolveMedia = (value) => {
    if (!value) return '';
    if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
    return `${SERVER_URL}${value.startsWith('/') ? '' : '/'}${value}`;
};

const makeEmptyArray = (count) => Array.from({ length: count }, () => '');

const CertificatesGenerator = () => {
    const [config, setConfig] = useState(defaultSeed);
    const [images, setImages] = useState(defaultImages);
    const [imageFiles, setImageFiles] = useState({});
    const [initiativeImages, setInitiativeImages] = useState(makeEmptyArray(24));
    const [concurrentImages, setConcurrentImages] = useState(makeEmptyArray(7));
    const [initiativeFiles, setInitiativeFiles] = useState({});
    const [concurrentFiles, setConcurrentFiles] = useState({});
    const [rawInitiativeLogos, setRawInitiativeLogos] = useState(makeEmptyArray(24));
    const [rawConcurrentLogos, setRawConcurrentLogos] = useState(makeEmptyArray(7));
    const [showImages, setShowImages] = useState(false);
    const [showText, setShowText] = useState(false);
    const [showInitiatives, setShowInitiatives] = useState(false);
    const [showConcurrent, setShowConcurrent] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadConfig = async () => {
        const res = await api.get('/api/arogya-certificate-config');
        const data = res.data?.data || {};
        setConfig({ ...defaultSeed, ...Object.fromEntries(Object.keys(defaultSeed).map((key) => [key, data[key] ?? defaultSeed[key]])) });
        setImages(Object.fromEntries(Object.keys(defaultImages).map((key) => [key, resolveMedia(data[key]) || defaultImages[key]])));

        const savedInitiatives = [...makeEmptyArray(24)];
        (data.initiativeLogos || []).forEach((url, index) => { savedInitiatives[index] = url || ''; });
        setRawInitiativeLogos(savedInitiatives);
        setInitiativeImages(savedInitiatives.map(resolveMedia));

        const savedConcurrent = [...makeEmptyArray(7)];
        (data.concurrentLogos || []).forEach((url, index) => { savedConcurrent[index] = url || ''; });
        setRawConcurrentLogos(savedConcurrent);
        setConcurrentImages(savedConcurrent.map(resolveMedia));
    };

    useEffect(() => {
        loadConfig().catch((error) => console.error('Failed to load certificate config', error));
    }, []);

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const readPreview = (file, callback) => {
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result);
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        const file = files?.[0];
        if (!file) return;
        setImageFiles(prev => ({ ...prev, [name]: file }));
        readPreview(file, (src) => setImages(prev => ({ ...prev, [name]: src })));
    };

    const handleLogoSlotChange = (e, index, type) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const setFiles = type === 'initiative' ? setInitiativeFiles : setConcurrentFiles;
        const setImagesForType = type === 'initiative' ? setInitiativeImages : setConcurrentImages;

        setFiles(prev => ({ ...prev, [index]: file }));
        readPreview(file, (src) => {
            setImagesForType(prev => {
                const next = [...prev];
                next[index] = src;
                return next;
            });
        });
    };

    const clearLogoSlot = (index, type) => {
        const setImagesForType = type === 'initiative' ? setInitiativeImages : setConcurrentImages;
        const setRawForType = type === 'initiative' ? setRawInitiativeLogos : setRawConcurrentLogos;
        const setFiles = type === 'initiative' ? setInitiativeFiles : setConcurrentFiles;

        setImagesForType(prev => {
            const next = [...prev];
            next[index] = '';
            return next;
        });
        setRawForType(prev => {
            const next = [...prev];
            next[index] = '';
            return next;
        });
        setFiles(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const saveConfig = async () => {
        setSaving(true);
        try {
            const form = new FormData();
            Object.entries(config).forEach(([key, value]) => form.append(key, value ?? ''));
            Object.entries(imageFiles).forEach(([key, file]) => form.append(key, file));
            form.append('initiativeLogos', JSON.stringify(rawInitiativeLogos));
            form.append('concurrentLogos', JSON.stringify(rawConcurrentLogos));
            Object.entries(initiativeFiles).forEach(([index, file]) => form.append(`initiativeLogo_${index}`, file));
            Object.entries(concurrentFiles).forEach(([index, file]) => form.append(`concurrentLogo_${index}`, file));

            await api.post('/api/arogya-certificate-config/update', form);
            setImageFiles({});
            setInitiativeFiles({});
            setConcurrentFiles({});
            await loadConfig();
            alert('Certificate settings saved.');
        } catch (error) {
            console.error('Failed to save certificate config', error);
            alert(error.response?.data?.message || 'Failed to save certificate settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-cert-generator" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <style>{`
                @media print {
                    .cert-form-sidebar { display: none !important; }
                    .admin-cert-generator { display: block !important; height: auto !important; }
                    .certi-page-shell { padding: 0 !important; }
                    body * { visibility: hidden !important; }
                    .admin-cert-generator, .admin-cert-generator * { visibility: visible !important; }
                    .cert-preview-container, .cert-preview-container * { visibility: visible !important; }
                }
            `}</style>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div className="cert-form-sidebar" style={{ width: '420px', backgroundColor: '#fff', borderRight: '1px solid #ccc', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Certificate Settings</h2>
                    <button onClick={() => setConfig(defaultSeed)} style={{ padding: '8px', background: '#d72624', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Reset Text to Seed</button>
                    <button onClick={saveConfig} disabled={saving} style={{ padding: '8px', background: '#1d7f3a', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', opacity: saving ? .7 : 1 }}>{saving ? 'Saving...' : 'Save Settings'}</button>
                    <button onClick={() => window.print()} style={{ padding: '8px', background: '#254b9f', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Print Certificate</button>

                    <h3 onClick={() => setShowImages(!showImages)} style={sectionHeaderStyle}>
                        Main Images
                        <span>{showImages ? '▼' : '▶'}</span>
                    </h3>
                    {showImages && Object.keys(images).map(key => (
                        <div key={key} style={fieldStyle}>
                            <label style={labelStyle}>{imageLabels[key] || key}</label>
                            <input type="file" accept="image/*" name={key} onChange={handleImageChange} style={{ fontSize: '12px' }} />
                        </div>
                    ))}

                    <h3 onClick={() => setShowInitiatives(!showInitiatives)} style={sectionHeaderStyle}>
                        Initiative Logos (Multiple)
                        <span>{showInitiatives ? '▼' : '▶'}</span>
                    </h3>
                    {showInitiatives && (
                        <LogoSlotEditor count={24} images={initiativeImages} type="initiative" onChange={handleLogoSlotChange} onClear={clearLogoSlot} />
                    )}

                    <h3 onClick={() => setShowConcurrent(!showConcurrent)} style={sectionHeaderStyle}>
                        Concurrent Event Logos (Multiple)
                        <span>{showConcurrent ? '▼' : '▶'}</span>
                    </h3>
                    {showConcurrent && (
                        <LogoSlotEditor count={7} images={concurrentImages} type="concurrent" onChange={handleLogoSlotChange} onClear={clearLogoSlot} />
                    )}

                    <h3 onClick={() => setShowText(!showText)} style={sectionHeaderStyle}>
                        Text Content
                        <span>{showText ? '▼' : '▶'}</span>
                    </h3>
                    {showText && Object.keys(config).map(key => (
                        <div key={key} style={fieldStyle}>
                            <label style={labelStyle}>{key}</label>
                            <textarea name={key} value={config[key]} onChange={handleTextChange} rows={key === 'recipientName' ? 1 : 3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                        </div>
                    ))}
                </div>
                <div className="cert-preview-container" style={{ flex: 1, backgroundColor: '#eeeeee', overflowY: 'auto' }}>
                    <Certi config={config} images={images} customInitiatives={initiativeImages} customConcurrent={concurrentImages} />
                </div>
            </div>
        </div>
    );
};

const sectionHeaderStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between'
};

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '14px', fontWeight: '500' };

const LogoSlotEditor = ({ count, images, type, onChange, onClear }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
        {Array.from({ length: count }).map((_, index) => (
            <div key={`${type}-${index}`} style={{ display: 'grid', gridTemplateColumns: '54px 1fr auto', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #eee', borderRadius: '6px' }}>
                <div style={{ width: 54, height: 34, border: '1px solid #ddd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                    {images[index] ? <img src={images[index]} alt={`${type} ${index + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 10, color: '#999' }}>Default</span>}
                </div>
                <div>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>{type === 'initiative' ? 'Initiative' : 'Concurrent'} Logo {index + 1}</label>
                    <input type="file" accept="image/*" onChange={(e) => onChange(e, index, type)} style={{ display: 'block', fontSize: 12, marginTop: 4 }} />
                </div>
                <button type="button" onClick={() => onClear(index, type)} style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12 }}>Default</button>
            </div>
        ))}
    </div>
);

export default CertificatesGenerator;
