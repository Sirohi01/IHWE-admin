import re

with open("/Users/mac/Downloads/9th IHWE/admin/src/pages/CertificatesGenerator.jsx", "r") as f:
    code = f.read()

# Add states for multiple images
state_insert = """
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
"""
code = code.replace("const [showText, setShowText] = useState(false);", "const [showText, setShowText] = useState(false);" + state_insert)

# Add UI for multiple images
ui_insert = """
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
"""
code = code.replace("                    <h3 onClick={() => setShowText(!showText)}", ui_insert + "\n                    <h3 onClick={() => setShowText(!showText)}")

# Pass new props to Certi
code = code.replace("<Certi config={config} images={images} />", "<Certi config={config} images={images} customInitiatives={initiativeImages} customConcurrent={concurrentImages} />")

with open("/Users/mac/Downloads/9th IHWE/admin/src/pages/CertificatesGenerator.jsx", "w") as f:
    f.write(code)

