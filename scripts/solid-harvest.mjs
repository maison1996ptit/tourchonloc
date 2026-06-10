import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');

// THE TRULY FINAL LIST: REDIRECT-SAFE IDS FROM DIRECT BROWSER TESTING
const solidData = [
  { id: 'v1', uid: '1555921015-5532091f6026' }, { id: 'v2', uid: '1524231757912-21f4fe3a7200' },
  { id: 'v3', uid: '1506126613408-eca07ce68773' }, { id: 'v4', uid: '1591965681123-03063f90558b' },
  { id: 'v5', uid: '1583417319914-f13b515ad29f' }, { id: 'v6', uid: '1559592442-7e182c9405db' },
  { id: 'v7', uid: '1599708153386-62e257e15822' }, { id: 'v8', uid: '1567124239-550302909787' },
  { id: 'v9', uid: '1549474843-ed8300454d26' }, { id: 'v10', uid: '1528127269322-539801943592' },
  { id: 'v11', uid: '1589553460730-df45f4474967' }, { id: 'v12', uid: '1543329064-181673830883' },
  { id: 'v13', uid: '1568285561501-13737b35e1d2' }, { id: 'v14', uid: '1584483730598-a3f2d22a5789' },
  { id: 'v15', uid: '1569344448-936d934898c1' }, { id: 'v17', uid: '1502901664414-27f4f65c92c9' },
  { id: 'j1', uid: '1542051841857-5f90071e7989' }, { id: 'j2', uid: '1493976040374-85c8e12f0c0e' },
  { id: 'j3', uid: '1590253504102-4246067756f1' }, { id: 'j4', uid: '1583133509310-85f0967a6d80' },
  { id: 'j5', uid: '1509023464722-18d996393ca8' }, { id: 'j7', uid: '1524413139049-108cb05ccd98' },
  { id: 'j16', uid: '1526481280693-3bfa75ac8efd' }, { id: 'j10', uid: '1528127269322-539801943592' },
  { id: 'j-air-1', uid: '1569154941061-e231b4725ef1' }, { id: 'j-air-2', uid: '1436491865332-7a61a109cc05' },
  { id: 'j-air-3', uid: '1558383030-9154941061b' }
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
  console.log("--- FINAL RELIABLE IMAGE SEED ---");
  for (const item of solidData) {
    const filePath = path.join(dir, `${item.id}.jpg`);
    const url = `https://images.unsplash.com/photo-${item.uid}?w=800&auto=format&fit=crop`;
    try {
      console.log(`Downloading ${item.id}...`);
      await download(url, filePath);
      console.log(`  [OK]`);
    } catch (e) {
      console.error(`  [FAIL] ${item.id}: ${e.message}`);
    }
  }
}
main();
