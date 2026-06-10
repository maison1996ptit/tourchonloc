import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');

async function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(filePath);
        res.pipe(file).on('finish', () => { file.close(); resolve(); });
      } else {
        res.resume();
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  const item = { id: 'j5', n: 'Mt Fuji', url: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1600&q=90&auto=format&fit=crop' };
  const fileName = `${item.id}_FINAL_PROVEN.jpg`;
  const filePath = path.join(dir, fileName);
  try {
    console.log(`Downloading ${item.n}...`);
    await download(item.url, filePath);
    console.log(`  [OK] Saved as ${fileName}`);
  } catch (e) {
    console.error(`  [FAIL] ${e.message}`);
  }
}
main();
