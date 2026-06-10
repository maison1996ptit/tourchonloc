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
    { id: 'j1', n: 'Shibuya', uid: '1542051841857-5f90071e7989' },
    { id: 'j5', n: 'Mt Fuji', uid: '1509023464722-18d996393ca8' }
  ];

  console.log("--- FINAL SURGICAL RESTORATION: JAPAN CORES ---");
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
