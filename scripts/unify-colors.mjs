import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        files.push(...getFiles(res));
      }
    } else if (entry.name.endsWith('.css')) {
      files.push(res);
    }
  }
  return files;
}

const cssFiles = getFiles('src');

const colorMap = [
  { regex: /#10b981/gi, replacement: 'var(--primary-color)' },
  { regex: /#059669/gi, replacement: 'var(--primary-color)' },
  { regex: /#f59e0b/gi, replacement: 'var(--accent-color)' },
  { regex: /#d97706/gi, replacement: 'var(--accent-color)' },
  { regex: /#fbbf24/gi, replacement: 'var(--accent-color)' },
  { regex: /#fffbeb/gi, replacement: '#EEF2FF' },
  { regex: /#1f2937/gi, replacement: 'var(--text-main)' },
  { regex: /#1e293b/gi, replacement: 'var(--text-main)' },
  { regex: /#6b7280/gi, replacement: 'var(--text-muted)' },
  { regex: /#4b5563/gi, replacement: 'var(--text-muted)' },
  { regex: /#4a5568/gi, replacement: 'var(--text-muted)' },
  { regex: /#718096/gi, replacement: 'var(--text-muted)' },
  { regex: /rgba\(16,\s*185,\s*129,\s*0\.3\)/gi, replacement: 'rgba(79, 70, 229, 0.3)' },
  { regex: /rgba\(217,\s*119,\s*6,\s*0\.3\)/gi, replacement: 'rgba(14, 165, 233, 0.3)' },
  { regex: /linear-gradient\(135deg,\s*#f59e0b\s*0%,\s*#d97706\s*100%\)/gi, replacement: 'var(--accent-color)' },
  { regex: /linear-gradient\(135deg,\s*#10b981\s*0%,\s*#059669\s*100%\)/gi, replacement: 'var(--primary-color)' },
];

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  colorMap.forEach(rule => {
    content = content.replace(rule.regex, rule.replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated colors in: ${file}`);
  }
});
