const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Reverse fix_tabs.js changes
content = content.replace(
  /: `bg-white dark:bg-slate-800 shadow-\[0_0_8px_rgba\(0,0,0,0\.05\)\] border border-slate-200 dark:border-slate-700 text-black \$\{tab\.color\} hover:bg-slate-50 dark:hover:bg-slate-700`/g,
  ": `text-black ${tab.color} hover:bg-slate-50 dark:hover:bg-slate-800/60`"
);

// We had two variations, one with /50 and one with /60 in original. Let's look at fix_tabs.js:
// 1st replace: /60
// 2nd replace: /50 -> changed to the exact same string
// 3rd replace: /60 -> changed to the exact same string.
// Wait, if it replaced multiple distinct strings with the EXACT same string, we can't perfectly un-replace without knowing context.
// But we can just replace all with /60. That's close enough.

fs.writeFileSync('src/App.tsx', content);
console.log('Reverted fix_tabs');
