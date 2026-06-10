import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');

// Alternative high-reliability source: Source Unsplash (no photo- prefix)
const retryData = [
  { id: 'v4', name: 'ninhbinh', query: 'ninh-binh-vietnam' },
  { id: 'v5', name: 'hue', query: 'hue-vietnam' },
  { id: 'v6', name: 'danang', query: 'da-nang-vietnam' },
  { id: 'v7', name: 'hoian', query: 'hoi-an-vietnam' },
  { id: 'v8', name: 'nhatrang', query: 'nha-trang-vietnam' },
  { id: 'v9', name: 'dalat', query: 'da-lat-vietnam' },
  { id: 'v11', name: 'phuquoc', query: 'phu-quoc-island' },
  { id: 'v12', name: 'cantho', query: 'mekong-delta-vietnam' },
  { id: 'v13', name: 'muine', query: 'mui-ne-vietnam' },
  { id: 'v14', name: 'phongnha', query: 'phong-nha-cave' },
  { id: 'v15', name: 'quynhon', query: 'quy-nhon-vietnam' },
  { id: 'v17', name: 'hagiang', query: 'ha-giang-vietnam' },
  { id: 'v18', name: 'condao', query: 'con-dao-island' },
  { id: 'j-air-1', name: 'narita', query: 'narita-airport' },
  { id: 'j-air-3', name: 'haneda', query: 'haneda-airport' },
  { id: 'j3', name: 'osaka', query: 'osaka-castle' },
  { id: 'j4', name: 'hokkaido', query: 'hokkaido-winter' },
  { id: 'j7', name: 'nara', query: 'nara-park' },
  { id: 'j16', name: 'shirakawago', query: 'shirakawa-go' },
  { id: 'j13', name: 'kamakura', query: 'kamakura-japan' },
  { id: 'j17', name: 'takayama', query: 'takayama-japan' },
  { id: 'j19', name: 'beppu', query: 'beppu-onsen' },
  { id: 'j20', name: 'kagoshima', query: 'kagoshima-japan' },
  { id: 'j22', name: 'nagoya', query: 'nagoya-castle' },
  { id: 'j23', name: 'ise', query: 'ise-jingu' },
  { id: 'j24', name: 'sendai', query: 'sendai-japan' },
  { id: 'j25', name: 'matsumoto', query: 'matsumoto-castle' },
  { id: 'j27', name: 'okayama', query: 'okayama-garden' },
  { id: 'j28', name: 'nagasaki', query: 'nagasaki-japan' },
  { id: 'v29', name: 'vinhhy', query: 'vietnam-beach' },
  { id: 'v30', name: 'phanthiet', query: 'phan-thiet-vietnam' }
];

async function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        download(res.headers.location, filePath).then(resolve).catch(reject);
      } else if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filePath)).on('close', resolve);
      } else {
        res.resume();
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log("--- RETRYING WITH KEYWORD SEARCH ---");
  for (const item of retryData) {
    const url = `https://source.unsplash.com/featured/800x600?${encodeURIComponent(item.query)}`;
    const filePath = path.join(dir, `${item.id}.jpg`);
    try {
      console.log(`[SEARCH] ${item.query}...`);
      await download(url, filePath);
      console.log(`  [OK] Found and saved!`);
    } catch (e) {
      console.error(`  [FAIL] ${item.query}: ${e.message}`);
    }
  }
}

main();
