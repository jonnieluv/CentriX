const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\bdark:[a-zA-Z0-9/.\-]+\b/g, '');

content = content.replace(/className="([^"]+)"/g, (match, classes) => {
    return 'className="' + classes.replace(/\s+/g, ' ').trim() + '"';
});

content = content.replace(/className=\{`([^`]+)`\}/g, (match, classes) => {
    return 'className={`' + classes.replace(/\s+/g, ' ').trim() + '`}';
});

fs.writeFileSync('src/App.tsx', content);
console.log('Removed dark classes');
