const fs = require('fs');
const file = 'c:/Users/PC/Desktop/9th IHWE/admin/src/pages/BookAStand.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/className="text-red-500 font-medium">/g, 'className="text-slate-400 font-medium">');
fs.writeFileSync(file, content);
