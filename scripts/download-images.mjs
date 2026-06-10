import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  { name: 'hanoi.jpg', id: '1555921015-5532091f6026' },
  { name: 'halong.jpg', id: '1524231757912-21f4fe3a7200' },
  { name: 'sapa.jpg', id: '1506126613408-eca07ce68773' },
  { name: 'hcm.jpg', id: '1528127269322-539801943592' },
  { name: 'phuquoc.jpg', id: '1589553460730-df45f4474967' },
  { name: 'tokyo.jpg', id: '1540959733332-eab4deabeeaf' },
  { name: 'kyoto.jpg', id: '1493976040374-85c8e12f0c0e' },
  { name: 'osaka.jpg', id: '1590253504102-4246067756f1' },
  { name: 'mountfuji.jpg', id: '1509023464722-18d996393ca8' },
  { name: 'nara.jpg', id: '1524413139049-108cb05ccd98' },
  { name: 'airport.jpg', id: '1542296332-2e4473faf563' }
];

const dir = path.join(process.cwd(), 'public/images/guides');

async function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filePath))
           .on('error', reject)
           .once('close', () => resolve(filePath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With Status Code: ${res.statusCode}`));
      }
    });
  });
}

async function main() {
  console.log("--- STARTING IMAGE DOWNLOAD PENTEST ---");
  for (const img of images) {
    const url = `https://images.unsplash.com/photo-${img.id}?auto=format&fit=crop&q=80&w=800`;
    const filePath = path.join(dir, img.name);
    try {
      console.log(`Downloading ${img.name}...`);
      await download(url, filePath);
      console.log(`[OK] Saved to ${img.name}`);
    } catch (err) {
      console.error(`[FAILED] ${img.name}: ${err.message}`);
    }
  }
  console.log("--- DOWNLOAD COMPLETED ---");
}

main();
