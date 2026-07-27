import re

with open("certi.backup.jsx", "r") as f:
    code = f.read()

# Replace the beginning of the component
component_start = r'const Certi = \(\{[\s\S]*?\}\) => \{[\s\S]*?const safeCompanyName = [^\n]*;\n'
new_component_start = """
const Certi = ({ config, images }) => {
    const safeCompanyName = String(config?.recipientName || "").trim() || "";
"""

code = re.sub(component_start, new_component_start, code)

# Now replace all the dynamic variables in the JSX with config and images state
replacements = {
    '{supportedByLogo}': '{images?.supportedByLogo}',
    '{mainLogo}': '{images?.mainLogo}',
    '{titleLogo}': '{images?.titleLogo}',
    '{certificateHeading}': '{images?.certificateHeading}',
    '{founderSignature}': '{images?.founderSignature}',
    '{chairmanSignature}': '{images?.chairmanSignature}',
    '{globalAwardLogo}': '{images?.globalAwardLogo}',
    
    'SUPPORTED BY:': '{config?.supportedByText}',
    'Presents': '{config?.presentsText}',
    'This is to certify that{" "}': '{config?.bodyTextPart1}{" "}',
    'has actively participated in the 18th <br /> Edition of{" "}': '{config?.bodyTextPart2} <br /> ',
    'Arogya Sangosthi': '{config?.highlightText1}',
    'Seminar &amp; 9th Edition of{" "}': '{config?.bodyTextPart3}{" "}',
    'International Health &amp; Wellness <br />': '{config?.highlightText2} <br />',
    'Expo 2026': '{config?.highlightText3}',
    ', organised by Namo Gange Trust, held from 21st\n                            August to 23rd August 2026 <br /> at Pragati Maidan, New\n                            Delhi, Bharat. <br /> Your valuable contributions and\n                            active engagement during the seminar have greatly <br />\n                            enriched the discussions on healthcare and wellness. <br />\n                            We, at Namo Gange Trust, appreciate your dedication\n                            and wish you continued success <br /> in your future\n                            endeavours.': '{config?.bodyTextPart4} <br /> {config?.bodyTextPart5} <br /> {config?.bodyTextPart6} <br /> {config?.bodyTextPart7} <br /> {config?.bodyTextPart8} <br /> {config?.bodyTextPart9}',
    'H.H. Shri Acharya Jagdish Ji': '{config?.founderName}',
    'Founder': '{config?.founderRole}',
    'Shri Vijay Sharma': '{config?.chairmanName}',
    'Chairman': '{config?.chairmanRole}',
    'Namo Gange Trust Initiatives': '{config?.initiativesTitle}',
    'CONCURRENT EVENTS': '{config?.concurrentTitle}',
    'Head Office: 12/52, Site-II, Loni Road Industrial Area,\n                        Mohan Nagar, Ghaziabad 201007, UP, Bharat': '{config?.footerAddress}',
    'info@namogange.org | web: www.namogange.org': '{config?.footerContact}'
}

for old, new_ in replacements.items():
    code = code.replace(old, new_)

with open("certi.jsx", "w") as f:
    f.write(code)

