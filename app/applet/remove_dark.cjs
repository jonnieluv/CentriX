const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace 'dark:class-name'
content = content.replace(/\bdark:[a-zA-Z0-9/.\-]+\b/g, '');

// Clean up extra spaces inside className strings, just to be neat.
// This matches pattern className="..." to not mess up other code.
content = content.replace(/className="([^"]+)"/g, (match, classes) => {
    return 'className="' + classes.replace(/\s+/g, ' ').trim() + '"';
});

content = content.replace(/className=\{`([^`]+)`\}/g, (match, classes) => {
    return 'className={`' + classes.replace(/\s+/g, ' ').trim() + '`}';
});

fs.writeFileSync('src/App.tsx', content);
console.log('Removed dark classes');
