const fs = require('fs');
const file = 'c:/Users/PC/Desktop/9th IHWE/admin/src/pages/BookAStand.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<option value="">([^<]+)<\/option>/g, '<option value="" className="text-red-500 font-medium">$1</option>');
fs.writeFileSync(file, content);
