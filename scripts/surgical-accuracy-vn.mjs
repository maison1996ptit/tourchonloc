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
  const plan = [
    { id: 'v6', n: 'Golden Bridge', uid: '1559592442-7e182c9405db' },
    { id: 'v7', n: 'Hoi An', uid: '1599708153386-62e257e15822' }
  ];

  console.log("--- FINAL SURGICAL RESTORATION: CORE VIETNAM ---");
  for (const item of plan) {
    const url = `https://images.unsplash.com/photo-${item.uid}?w=1600&q=90&auto=format&fit=crop`;
    const filePath = path.join(dir, `REAL_${item.id}.jpg`);
    try {
      await download(url, filePath);
      console.log(`[OK] Saved ${item.n} as REAL_${item.id}.jpg`);
    } catch (e) {
      console.error(`[FAIL] ${item.n}`);
    }
  }
}
main();
