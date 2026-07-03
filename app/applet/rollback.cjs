const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove Sun, Moon from imports
content = content.replace(
  /Wrench, DoorOpen, Moon, Sun, LogOut/g,
  "Wrench, DoorOpen, LogOut"
);

// 2. Remove darkMode state block entirely
content = content.replace(
  /\n  \/\/ Theme state\n  const \[darkMode, setDarkMode\] = useState<boolean>\(\(\) => \{\n    return localStorage\.getItem\("centrix-dark-mode"\) === "true";\n  \}\);\n/g,
  ""
);

content = content.replace(
  /\s*\/\/ Darkmode hook\n  useEffect\(\(\) => \{\n    const root = window\.document\.documentElement;\n    if \(darkMode\) \{\n      root\.classList\.add\("dark"\);\n      localStorage\.setItem\("centrix-dark-mode", "true"\);\n    \} else \{\n      root\.classList\.remove\("dark"\);\n      localStorage\.setItem\("centrix-dark-mode", "false"\);\n    \}\n  \}, \[darkMode\]\);\n/g,
  ""
);

// 3. Revert main wrappers
content = content.replace(
  /<div className=\{\`min-h-screen font-sans \$\{darkMode \? "bg-slate-950 text-slate-100" : "bg-slate-200 text-black"\} text-\[12px\]\`\}>/,
  `<div className="min-h-screen font-sans bg-slate-200 text-black text-[12px]">`
);

content = content.replace(
  /className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden bg-slate-950"/,
  `className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden bg-slate-950"` // Oh wait, originally it was bg-slate-950 ! Look at my diff!
);

content = content.replace(
  /className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none"/,
  `className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-70 select-none pointer-events-none"`
);

content = content.replace(
  /<div className="absolute inset-0 bg-gradient-to-tr from-slate-950\/80 via-slate-950\/40 to-slate-950\/90 pointer-events-none" \/>/,
  `<div className="absolute inset-0 bg-gradient-to-tr from-slate-950/60 via-slate-950/10 to-slate-950/70 pointer-events-none" />`
);

content = content.replace(
  /className="w-full max-w-md bg-white backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-8 transition duration-200 relative z-10"/,
  `className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/85 shadow-2xl overflow-hidden p-6 transition duration-200 relative z-10"`
);

content = content.replace(
  /<h1 className="text-\[12px\] font-display font-medium text-black tracking-tight">/,
  `<h1 className="text-[12px] font-display font-medium text-black dark:text-white tracking-tight">`
);

content = content.replace(
  /<p className="text-slate-600 text-\[10px\] mt-1 tracking-wide">Multi-Departmental Client Operations<\/p>/,
  `<p className="text-black dark:text-white text-[10px] mt-1 tracking-wide">Multi-Departmental Client Operations</p>`
);

content = content.replace(
  /<label className="text-\[10px\] whitespace-nowrap uppercase font-bold tracking-widest text-slate-500 block mb-0\.5">Corporate Login ID<\/label>/,
  `<label className="text-[10px] whitespace-nowrap uppercase font-bold tracking-widest text-black dark:text-white block mb-0.5">Corporate Login ID</label>`
);

content = content.replace(
  /className="w-full p-2 text-\[11px\] rounded-xl border border-slate-200 bg-slate-50 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"/g,
  `className="w-full p-1.5 text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"`
);

content = content.replace(
  /<label className="text-\[10px\] whitespace-nowrap uppercase font-bold tracking-widest text-slate-500 block mb-0\.5">Passphrase<\/label>/,
  `<label className="text-[10px] whitespace-nowrap uppercase font-bold tracking-widest text-black dark:text-white block mb-0.5">Passphrase</label>`
);

content = content.replace(
  /className="w-full p-2 text-\[11px\] rounded-xl border border-slate-200 bg-slate-50 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium tracking-widest"/,
  `className="w-full p-1.5 text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium tracking-widest"`
);

content = content.replace(
  /<label className="text-\[10px\] whitespace-nowrap uppercase font-bold tracking-widest text-slate-500 block mb-0\.5">Department Desk<\/label>/,
  `<label className="text-[10px] whitespace-nowrap uppercase font-bold tracking-widest text-black dark:text-white block mb-0.5">Department Desk</label>`
);

content = content.replace(
  /className="w-full p-2 pr-8 text-\[11px\] rounded-xl border border-slate-200 bg-slate-50 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"/,
  `className="w-full p-1.5 pr-8 text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"`
);

content = content.replace(
  /<ChevronDown className="w-4 h-4 absolute right-2\.5 top-1\/2 -translate-y-1\/2 text-slate-400 pointer-events-none" \/>/g,
  `<ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-black dark:text-white pointer-events-none" />`
);

content = content.replace(
  /<input type="checkbox" id="rememberMe" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-3 h-3" \/>/,
  `<input type="checkbox" id="rememberMe" defaultChecked className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer w-3 h-3" />`
);

content = content.replace(
  /<label htmlFor="rememberMe" className="text-slate-600 select-none cursor-pointer font-medium mt-px">Stay synced<\/label>/,
  `<label htmlFor="rememberMe" className="text-black dark:text-white select-none cursor-pointer font-medium mt-px">Stay synced</label>`
);

content = content.replace(
  /className="text-[11px] bg-emerald-50 text-emerald-700 p-2 rounded-lg text-center font-medium border border-emerald-200 animate-pulse"/,
  `className="text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-2 rounded-lg text-center font-medium border border-emerald-200 dark:border-emerald-900 animate-pulse"`
);

content = content.replace(
  /<h3 className="text-\[12px\] font-bold text-slate-800">Recover CentriX Credentials<\/h3>/,
  `<h3 className="text-[12px] font-bold text-black dark:text-white">Recover CentriX Credentials</h3>`
);

content = content.replace(
  /<p className="text-\[12px\] text-slate-600">/,
  `<p className="text-[12px] text-black dark:text-white">`
);

content = content.replace(
  /<label className="text-\[10px\] uppercase font-bold tracking-wider text-slate-500 block mb-1">Corporate Email<\/label>/,
  `<label className="text-[10px] uppercase font-bold tracking-wider text-black dark:text-white block mb-1">Corporate Email</label>`
);

content = content.replace(
  /className="w-full p-2.5 text-\[12px\] rounded-lg border border-slate-200 bg-slate-50 text-black focus:ring-1 focus:ring-blue-600"/,
  `className="w-full p-2.5 text-[12px] rounded-lg border bg-slate-50 dark:bg-slate-800 text-black dark:text-white focus:ring-1 focus:ring-blue-600"`
);

content = content.replace(
  /className="text-\[11px\] bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-lg text-left font-mono"/,
  `className="text-[11px] bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 p-2 rounded-lg text-left font-mono"`
);

content = content.replace(
  /<label className="text-\[10px\] uppercase font-bold text-slate-500 block">Verify EPHEMERAL PIN<\/label>/,
  `<label className="text-[10px] uppercase font-bold text-black dark:text-white block">Verify EPHEMERAL PIN</label>`
);

content = content.replace(
  /className="w-full p-2 text-\[12px\] rounded-md border border-slate-200 text-center font-bold tracking-widest bg-white"/,
  `className="w-full p-2 text-[12px] rounded-md border text-center font-bold tracking-widest"`
);

content = content.replace(
  /className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-\[12px\] font-semibold rounded-md transition-colors"/,
  `className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-black dark:text-white text-[12px] font-semibold rounded-md"`
);

content = content.replace(
  /className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-\[12px\] font-semibold rounded-md transition-shadow"/,
  `className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md"`
);

content = content.replace(
  /className="text-blue-600 hover:text-blue-700 font-semibold transition-colors mt-px"/,
  `className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors mt-px"`
);

content = content.replace(
  /<div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">/,
  `<div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">`
);

content = content.replace(
  /<span className="text-\[10px\] text-slate-400 block">/,
  `<span className="text-[10px] text-black dark:text-white block">`
);

content = content.replace(
  /<div className="flex justify-center gap-4 text-\[10px\]">\n\s*<a href="\/knowledge-base\/terms-of-use" className="text-blue-600 hover:underline">Term of use<\/a>\n\s*<a href="\/knowledge-base\/data-privacy" className="text-blue-600 hover:underline">Data Privacy<\/a>\n\s*<\/div>/,
  `<div className="flex justify-center gap-4 text-[10px]">\n                  <a href="/knowledge-base/terms-of-use" className="text-blue-600 hover:underline dark:text-blue-400">Term of use</a>\n                  <a href="/knowledge-base/data-privacy" className="text-blue-600 hover:underline dark:text-blue-400">Data Privacy</a>\n                </div>`
);

content = content.replace(
  /className="flex h-screen w-full bg-\[\#f6f7fa\] dark:bg-slate-900 overflow-hidden"/,
  `className="flex h-screen w-full bg-[#f6f7fa] dark:bg-slate-900 overflow-hidden"`
);

content = content.replace(
  /className=\{\`flex-1 flex flex-col min-w-0 \$\{darkMode \? "bg-slate-900" : "bg-\[\#f9fafc\]"\} border-l border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden text-\[12px\]\`\}/,
  `className="flex-1 flex flex-col min-w-0 bg-[#f9fafc] border-l border-slate-200 relative z-10 overflow-hidden text-[12px]"`
);

content = content.replace(
  /className=\{\`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2\.5 flex items-center justify-between w-full shadow-xs transition-colors h-14 shrink-0\`\}/,
  `className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between w-full shadow-xs transition-colors h-14 shrink-0"`
);

// strip out the dark mode button
content = content.replace(
  /\s*<button className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-sm" onClick=\{\(\) => setDarkMode\(!darkMode\)\} title="Toggle Dark Mode">\n\s*\{darkMode \? <Sun className="w-4 h-4 text-slate-600 dark:text-amber-400" \/> : <Moon className="w-4 h-4" \/>\}\n\s*<\/button>/g,
  ""
);

content = content.replace(
  /\s*\{\/\* Dark mode toggler inside Login card \*\/\}\n\s*<div className="absolute top-3 right-3">\n\s*<button\n\s*type="button"\n\s*onClick=\{\(\) => setDarkMode\(!darkMode\)\}\n\s*className="p-1 px-1.5 text-\[10px\] rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"\n\s*>\n\s*\{darkMode \? <Sun className="w-3 h-3 text-amber-500" \/> : <Moon className="w-3 h-3 text-blue-600" \/>\}\n\s*\{darkMode \? "Light" : "Dark"\}\n\s*<\/button>\n\s*<\/div>\n\n/g,
  ""
);


fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx Rollback Completed.');

