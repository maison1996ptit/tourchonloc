import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const retryLandmarks = [
  { id: 'v2', name: 'Ha Long Bay', url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop' },
  { id: 'v9', name: 'Da Lat', url: 'https://images.unsplash.com/photo-1549474843-ed8300454d26?q=80&w=800&auto=format&fit=crop' },
  { id: 'v16', name: 'Ha Giang', url: 'https://images.unsplash.com/photo-1502901664414-27f4f65c92c9?q=80&w=800&auto=format&fit=crop' },
  { id: 'j13', name: 'Fukuoka', url: 'https://images.unsplash.com/photo-1558862107-d49ef2a04d72?q=80&w=800&auto=format&fit=crop' }
];

async function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, filePath).then(resolve).catch(reject);
      } else if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filePath)).on('finish', resolve);
      } else {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log("--- RETRYING FAILED HARVESTS ---");
  for (const item of retryLandmarks) {
    const filePath = path.join(dir, `${item.id}.jpg`);
    try {
      console.log(`[RETRYING] ${item.id}: ${item.name}...`);
      await download(item.url, filePath);
      console.log(`  [OK]`);
    } catch (e) {
      console.error(`  [FAIL] ${item.id}: ${e.message}`);
    }
  }
}
main();
