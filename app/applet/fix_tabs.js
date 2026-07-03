const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) results.push(file);
    }
  });
  return results;
}

const files = walk("src");

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let modified = content;

  // Enhance all tab styles across panels
  modified = modified.replace(
    /: `text-black \$\{tab\.color\} hover:bg-slate-50 dark:hover:bg-slate-800\/60`/g,
    ": `bg-white dark:bg-slate-800 shadow-[0_0_8px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-700 text-black ${tab.color} hover:bg-slate-50 dark:hover:bg-slate-700`"
  );
  
  // IT Settings Panel specific
  modified = modified.replace(
    /: `text-black \$\{tab\.color\} hover:bg-slate-50 dark:hover:bg-slate-800\/50`/g,
    ": `bg-white dark:bg-slate-800 shadow-[0_0_8px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-700 text-black ${tab.color} hover:bg-slate-50 dark:hover:bg-slate-700`"
  );

  // Marketing Panel specific
  modified = modified.replace(
    /: `text-black \$\{tab\.color\} hover:bg-slate-50 dark:hover:bg-slate-800\/60`/g,
    ": `bg-white dark:bg-slate-800 shadow-[0_0_8px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-700 text-black ${tab.color} hover:bg-slate-50 dark:hover:bg-slate-700`"
  );

  if (modified !== content) {
    fs.writeFileSync(file, modified);
    console.log("Modified " + file);
  }
}
