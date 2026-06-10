import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');

const finalAttempt = [
  { id: 'v1', url: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=800' },
  { id: 'v2', url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800' },
  { id: 'v3', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800' },
  { id: 'v10', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800' },
  { id: 'j1', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800' },
  { id: 'j2', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
  { id: 'j3', url: 'https://images.unsplash.com/photo-1590253504102-4246067756f1?w=800' },
  { id: 'j5', url: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800' }
];

async function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filePath)).on('close', resolve);
      } else {
        res.resume();
        reject(new Error(res.statusCode));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log("--- FINAL ABSOLUTE DOWNLOAD ---");
  for (const item of finalAttempt) {
    const filePath = path.join(dir, `${item.id}.jpg`);
    try {
      console.log(`Downloading ${item.id}...`);
      await download(item.url, filePath);
      console.log(`  [OK]`);
    } catch (e) {
      console.error(`  [FAIL] ${e.message}`);
    }
  }
}
main();
