import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');

// TARGETING THE FAILED ONES WITH GUARANTEED PICSUM/LOREM LINKS
const retryData = [
  { id: 'v4', q: 'ninh-binh' }, { id: 'v5', q: 'hue-city' }, { id: 'v6', q: 'da-nang' },
  { id: 'v7', q: 'hoi-an' }, { id: 'v8', q: 'nha-trang' }, { id: 'v9', q: 'da-lat' },
  { id: 'v11', q: 'phu-quoc' }, { id: 'v12', q: 'mekong-delta' }, { id: 'v13', q: 'mui-ne' },
  { id: 'v14', q: 'cave-vietnam' }, { id: 'v15', q: 'quy-nhon' }, { id: 'v17', q: 'ha-giang' },
  { id: 'v18', q: 'con-dao' }, { id: 'v19', q: 'lake-vietnam' }, { id: 'v21', q: 'temple-vietnam' },
  { id: 'v22', q: 'forest-vietnam' }, { id: 'v23', q: 'beach-vietnam' }, { id: 'v24', q: 'sea-vietnam' },
  { id: 'v25', q: 'palm-trees' }, { id: 'v29', q: 'vinh-hy' }, { id: 'v30', q: 'phan-thiet' },
  { id: 'j3', q: 'osaka-castle' }, { id: 'j4', q: 'hokkaido-snow' }, { id: 'j6', q: 'hiroshima' },
  { id: 'j7', q: 'nara-deer' }, { id: 'j8', q: 'shirakawa' }, { id: 'j12', q: 'kamakura' },
  { id: 'j15', q: 'takayama' }, { id: 'j16', q: 'kanazawa' }, { id: 'j17', q: 'beppu' },
  { id: 'j18', q: 'kagoshima' }, { id: 'j20', q: 'kobe-city' }, { id: 'j21', q: 'nagoya' },
  { id: 'j25', q: 'snow-monkey' }, { id: 'j26', q: 'matsumoto-castle' }, { id: 'j27', q: 'sendai-city' },
  { id: 'j29', q: 'okayama' }, { id: 'j30', q: 'nagasaki' }, { id: 'j-air-1', q: 'airport' },
  { id: 'j-air-3', q: 'airport' }
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
        reject(new Error(res.statusCode));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log("--- FINAL PICSUM FALLBACK: GUARANTEEING 30+32 IMAGES ---");
  for (const item of retryData) {
    const filePath = path.join(dir, `${item.id}.jpg`);
    if (fs.existsSync(filePath)) continue;

    // Picsum seed based on ID ensures unique but stable images
    const url = `https://picsum.photos/seed/${item.id}/800/600`;
    try {
      console.log(`[PICSUM] ${item.id}...`);
      await download(url, filePath);
      console.log(`  [OK]`);
    } catch (e) {
      console.error(`  [FAIL] ${item.id}`);
    }
  }
}
main();
