const fs = require('fs');
const glob = require('glob');
const path = require('path');

const mappings = {
  'bg-white': 'bg-white dark:bg-[#152033]',
  'text-[#121c2a]': 'text-[#121c2a] dark:text-white',
  'bg-[#f9f9ff]': 'bg-[#f9f9ff] dark:bg-[#0d1627]',
  'border-[#dee9fd]': 'border-[#dee9fd] dark:border-[#2b3a54]',
  'border-[#eff3ff]': 'border-[#eff3ff] dark:border-[#1e2d4a]',
  'bg-[#eff3ff]': 'bg-[#eff3ff] dark:bg-[#1e2d4a]',
  'bg-[#dee9fd]': 'bg-[#dee9fd] dark:bg-[#2b3a54]',
  'text-[#434654]': 'text-[#434654] dark:text-[#c7d2fe]',
  'text-[#737686]': 'text-[#737686] dark:text-[#94a3b8]',
  'bg-[#e6eeff]': 'bg-[#e6eeff] dark:bg-[#1e293b]',
  'border-[#e6eeff]': 'border-[#e6eeff] dark:border-[#334155]',
};

// Also replace double spaces to clean up
const files = glob.sync('src/**/*.jsx', { cwd: __dirname });

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip ShareResultCapture so it stays strictly light mode for standard captures
  if (file.includes('ShareResultCapture.jsx')) return;

  let changed = false;
  for (const [light, dark] of Object.entries(mappings)) {
    // Only replace if it doesn't already have dark: right after it
    // Standard basic string replacement with regex to avoid double applying
    const regex = new RegExp(light.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '(?! dark:)', 'g');
    if (regex.test(content)) {
      content = content.replace(regex, dark);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
