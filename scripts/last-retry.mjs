import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');

const lastTen = [
  { id: 'v13', url: 'https://images.pexels.com/photos/2351423/pexels-photo-2351423.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j17', url: 'https://images.pexels.com/photos/2525903/pexels-photo-2525903.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j19', url: 'https://images.pexels.com/photos/1440475/pexels-photo-1440475.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j21', url: 'https://images.pexels.com/photos/1440474/pexels-photo-1440474.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j23', url: 'https://images.pexels.com/photos/2525904/pexels-photo-2525904.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j24', url: 'https://images.pexels.com/photos/2525905/pexels-photo-2525905.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j25', url: 'https://images.pexels.com/photos/1440473/pexels-photo-1440473.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j26', url: 'https://images.pexels.com/photos/2525906/pexels-photo-2525906.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j29', url: 'https://images.pexels.com/photos/1440471/pexels-photo-1440471.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j31', url: 'https://images.pexels.com/photos/1440470/pexels-photo-1440470.jpeg?auto=compress&cs=tinysrgb&w=800' }
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
  for (const item of lastTen) {
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
