import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const missing = [
  { id: 'v9', url: 'https://images.pexels.com/photos/3371661/pexels-photo-3371661.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v16', url: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800' }
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
  for (const item of missing) {
    const filePath = path.join(dir, `${item.id}.jpg`);
    try {
      await download(item.url, filePath);
      console.log(`[OK] ${item.id}`);
    } catch (e) {
      console.error(`[FAIL] ${item.id}`);
    }
  }
}
main();
