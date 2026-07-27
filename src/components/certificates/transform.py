import re

with open("certi.backup.jsx", "r") as f:
    code = f.read()

# Replace the beginning of the component
component_start = r'const Certi = \(\{[\s\S]*?\}\) => \{[\s\S]*?const safeCompanyName = [^\n]*;\n'
new_component_start = """
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

const Certi = () => {
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

    const safeCompanyName = String(config.recipientName || "").trim() || "";
"""

code = re.sub(component_start, new_component_start, code)

# Fix imports, add useState
if "import React" in code and "useState" not in code:
    code = code.replace('import React from "react";', 'import React, { useState } from "react";')

# Now let's inject the Form UI before the certificate preview wrap
form_ui = """
        <div className="admin-cert-generator" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <style>{`
                @media print {
                    .cert-form-sidebar { display: none !important; }
                    .admin-cert-generator { display: block !important; height: auto !important; }
                    .certi-page-shell { padding: 0 !important; }
                }
            `}</style>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div className="cert-form-sidebar" style={{ width: '400px', backgroundColor: '#fff', borderRight: '1px solid #ccc', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Certificate Settings</h2>
                    <button onClick={() => setConfig(defaultSeed)} style={{ padding: '8px', background: '#d72624', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Reset to Default Seed</button>
                    <button onClick={() => window.print()} style={{ padding: '8px', background: '#254b9f', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Print Certificate</button>
                    
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Images (Upload to Change)</h3>
                    {Object.keys(images).map(key => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>{key}</label>
                            <input type="file" accept="image/*" name={key} onChange={handleImageChange} style={{ fontSize: '12px' }} />
                        </div>
                    ))}

                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Text Content</h3>
                    {Object.keys(config).map(key => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>{key}</label>
                            <textarea name={key} value={config[key]} onChange={handleTextChange} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, backgroundColor: '#eeeeee', overflowY: 'auto' }}>
"""

code = code.replace('<div className="certi-page-shell">', '<div className="certi-page-shell">\n' + form_ui)

# Need to close the added divs at the end
code = code.replace('        </div>\n    );\n};', '                </div>\n            </div>\n        </div>\n        </div>\n    );\n};')

# Now replace all the dynamic variables in the JSX with config and images state
replacements = {
    '{supportedByLogo}': '{images.supportedByLogo}',
    '{mainLogo}': '{images.mainLogo}',
    '{titleLogo}': '{images.titleLogo}',
    '{certificateHeading}': '{images.certificateHeading}',
    '{founderSignature}': '{images.founderSignature}',
    '{chairmanSignature}': '{images.chairmanSignature}',
    '{globalAwardLogo}': '{images.globalAwardLogo}',
    
    'SUPPORTED BY:': '{config.supportedByText}',
    'Presents': '{config.presentsText}',
    'This is to certify that{" "}': '{config.bodyTextPart1}{" "}',
    'has actively participated in the 18th <br /> Edition of{" "}': '{config.bodyTextPart2} <br /> ',
    'Arogya Sangosthi': '{config.highlightText1}',
    'Seminar &amp; 9th Edition of{" "}': '{config.bodyTextPart3}{" "}',
    'International Health &amp; Wellness <br />': '{config.highlightText2} <br />',
    'Expo 2026': '{config.highlightText3}',
    ', organised by Namo Gange Trust, held from 21st\n                            August to 23rd August 2026 <br /> at Pragati Maidan, New\n                            Delhi, Bharat. <br /> Your valuable contributions and\n                            active engagement during the seminar have greatly <br />\n                            enriched the discussions on healthcare and wellness. <br />\n                            We, at Namo Gange Trust, appreciate your dedication\n                            and wish you continued success <br /> in your future\n                            endeavours.': '{config.bodyTextPart4} <br /> {config.bodyTextPart5} <br /> {config.bodyTextPart6} <br /> {config.bodyTextPart7} <br /> {config.bodyTextPart8} <br /> {config.bodyTextPart9}',
    'H.H. Shri Acharya Jagdish Ji': '{config.founderName}',
    'Founder': '{config.founderRole}',
    'Shri Vijay Sharma': '{config.chairmanName}',
    'Chairman': '{config.chairmanRole}',
    'Namo Gange Trust Initiatives': '{config.initiativesTitle}',
    'CONCURRENT EVENTS': '{config.concurrentTitle}',
    'Head Office: 12/52, Site-II, Loni Road Industrial Area,\n                        Mohan Nagar, Ghaziabad 201007, UP, Bharat': '{config.footerAddress}',
    'info@namogange.org | web: www.namogange.org': '{config.footerContact}'
}

for old, new_ in replacements.items():
    code = code.replace(old, new_)

with open("certi.jsx", "w") as f:
    f.write(code)

