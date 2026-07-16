import React, { useState } from 'react';
import Certi from '../components/certificates/Certi';

// Default seed from original Certi.jsx
import certificateBackground from "../assets/certificates/Certificate/Background.jpg";
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

const CertificatesGenerator = () => {
    const [config, setConfig] = useState(defaultSeed);
    const [images, setImages] = useState({
        supportedByLogo: msmeSupportedBy,
        mainLogo: namoGangeLogo,
        titleLogo: eventLogo,
        certificateHeading: certificateHeading,
        founderSignature: founderSignature,
        chairmanSignature: chairmanSignature,
        globalAwardLogo: globalAwardLogo
    });
    
    const [showImages, setShowImages] = useState(false);
    const [showText, setShowText] = useState(false);
    const [initiativeImages, setInitiativeImages] = useState([]);
    const [concurrentImages, setConcurrentImages] = useState([]);
    const [showInitiatives, setShowInitiatives] = useState(false);
    const [showConcurrent, setShowConcurrent] = useState(false);

    const handleMultipleImageChange = (e, setter) => {
        const files = Array.from(e.target.files);
        const filePromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });
        Promise.all(filePromises).then(results => setter(results));
    };


    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({...prev, [name]: value}));
    };

    const handleImageChange = (e) => {
        const { name } = e.target;
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => ({...prev, [name]: reader.result}));
            };
            reader.readAsDataURL(file);
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
                <div className="cert-form-sidebar" style={{ width: '400px', backgroundColor: '#fff', borderRight: '1px solid #ccc', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Certificate Settings</h2>
                    <button onClick={() => setConfig(defaultSeed)} style={{ padding: '8px', background: '#d72624', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Reset to Default Seed</button>
                    <button onClick={() => window.print()} style={{ padding: '8px', background: '#254b9f', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Print Certificate</button>
                    
                    <h3 onClick={() => setShowImages(!showImages)} style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        Images (Upload to Change)
                        <span>{showImages ? '▼' : '▶'}</span>
                    </h3>
                    {showImages && Object.keys(images).map(key => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>{key}</label>
                            <input type="file" accept="image/*" name={key} onChange={handleImageChange} style={{ fontSize: '12px' }} />
                        </div>
                    ))}


                    <h3 onClick={() => setShowInitiatives(!showInitiatives)} style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        Initiative Logos (Multiple)
                        <span>{showInitiatives ? '▼' : '▶'}</span>
                    </h3>
                    {showInitiatives && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: '#666' }}>Upload up to 24 images. Replaces default ones.</label>
                            <input type="file" multiple accept="image/*" onChange={(e) => handleMultipleImageChange(e, setInitiativeImages)} style={{ fontSize: '12px' }} />
                        </div>
                    )}

                    <h3 onClick={() => setShowConcurrent(!showConcurrent)} style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        Concurrent Event Logos (Multiple)
                        <span>{showConcurrent ? '▼' : '▶'}</span>
                    </h3>
                    {showConcurrent && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: '#666' }}>Upload up to 7 images. Replaces default ones.</label>
                            <input type="file" multiple accept="image/*" onChange={(e) => handleMultipleImageChange(e, setConcurrentImages)} style={{ fontSize: '12px' }} />
                        </div>
                    )}

                    <h3 onClick={() => setShowText(!showText)} style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        Text Content
                        <span>{showText ? '▼' : '▶'}</span>
                    </h3>
                    {showText && Object.keys(config).map(key => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>{key}</label>
                            <textarea name={key} value={config[key]} onChange={handleTextChange} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
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

export default CertificatesGenerator;
