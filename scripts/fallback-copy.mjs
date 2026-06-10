import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public/images/guides');

const fallbacks = [
  { target: 'v13', source: 'v37' },
  { target: 'j19', source: 'j4' },
  { target: 'j21', source: 'j11' },
  { target: 'j23', source: 'j3' },
  { target: 'j24', source: 'j14' },
  { target: 'j25', source: 'j8' },
  { target: 'j26', source: 'j3' },
  { target: 'j29', source: 'j9' },
  { target: 'j31', source: 'j8' }
];

for (const fb of fallbacks) {
  const sourcePath = path.join(dir, `${fb.source}.jpg`);
  const targetPath = path.join(dir, `${fb.target}.jpg`);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Fallback copied ${fb.source} to ${fb.target}`);
  }
}
