import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');

const finalEmergencyData = [
  { id: 'v2', url: 'https://images.pexels.com/photos/1518723/pexels-photo-1518723.jpeg?w=800' }, // Ha Long
  { id: 'v9', url: 'https://images.pexels.com/photos/1824477/pexels-photo-1824477.jpeg?w=800' }, // Da Lat
  { id: 'v17', url: 'https://images.pexels.com/photos/3371661/pexels-photo-3371661.jpeg?w=800' }, // Ha Giang
  { id: 'j2', url: 'https://images.pexels.com/photos/161401/kinkakuji-kyoto-japan-temple-161401.jpeg?w=800' }, // Kyoto
  { id: 'j8', url: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?w=800' }, // Shirakawa
  { id: 'j9', url: 'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?w=800' }, // Hakone
  { id: 'j12', url: 'https://images.pexels.com/photos/161401/kinkakuji-kyoto-japan-temple-161401.jpeg?w=800' }, // Kamakura
  { id: 'j13', url: 'https://images.pexels.com/photos/161401/kinkakuji-kyoto-japan-temple-161401.jpeg?w=800' }, // Nikko
  { id: 'j14', url: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?w=800' }, // Fukuoka
  { id: 'j15', url: 'https://images.pexels.com/photos/1434812/pexels-photo-1434812.jpeg?w=800' }, // Takayama
  { id: 'j-air-1', url: 'https://images.pexels.com/photos/163792/pexels-photo-163792.jpeg?w=800' } // Airport
];

async function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filePath)).on('finish', resolve);
      } else {
        res.resume();
        reject(new Error(res.statusCode));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log("--- FINAL EMERGENCY PEXELS DOWNLOAD ---");
  for (const item of finalEmergencyData) {
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
