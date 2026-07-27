import re

with open("/Users/mac/Downloads/9th IHWE/admin/src/components/certificates/certi.jsx", "r") as f:
    code = f.read()

code = code.replace("const Certi = ({ config, images }) => {", "const Certi = ({ config, images, customInitiatives = [], customConcurrent = [] }) => {")

old_init_map = "{initiativeLogoSlots.map((logo) => ("
new_init_map = "{(customInitiatives && customInitiatives.length > 0 ? customInitiatives.map((src, i) => ({ id: `custom-init-${i}`, src, alt: \"Custom Initiative\" })) : initiativeLogoSlots).map((logo) => ("
code = code.replace(old_init_map, new_init_map)

old_conc_map = "{concurrentLogoSlots.map((logo) => ("
new_conc_map = "{(customConcurrent && customConcurrent.length > 0 ? customConcurrent.map((src, i) => ({ id: `custom-conc-${i}`, src, alt: \"Custom Concurrent\", fit: \"wide\" })) : concurrentLogoSlots).map((logo) => ("
code = code.replace(old_conc_map, new_conc_map)

with open("/Users/mac/Downloads/9th IHWE/admin/src/components/certificates/certi.jsx", "w") as f:
    f.write(code)

