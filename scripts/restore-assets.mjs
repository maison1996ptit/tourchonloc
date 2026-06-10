import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const destinationData = [
  // VIETNAM (32)
  { id: 'v-air-1', name: 'noibai', unsplashId: '1542296332-2e4473faf563' },
  { id: 'v-air-2', name: 'tsn', unsplashId: '1530521954074-e64f6810b32d' },
  { id: 'v1', name: 'hanoi', unsplashId: '1555921015-5532091f6026' },
  { id: 'v2', name: 'halong', unsplashId: '1524231757912-21f4fe3a7200' },
  { id: 'v3', name: 'sapa', unsplashId: '1506126613408-eca07ce68773' },
  { id: 'v4', name: 'ninhbinh', unsplashId: '1540321481134-7d589370076a' },
  { id: 'v5', name: 'hue', unsplashId: '1593922646399-528f110757d9' },
  { id: 'v6', name: 'danang', unsplashId: '1559592442-7e182c9405db' },
  { id: 'v7', name: 'hoian', unsplashId: '1599708153386-62e257e15822' },
  { id: 'v8', name: 'nhatrang', unsplashId: '1567124239-550302909787' },
  { id: 'v9', name: 'dalat', unsplashId: '1549474843-ed8300454d26' },
  { id: 'v10', name: 'hcm', unsplashId: '1528127269322-539801943592' },
  { id: 'v11', name: 'phuquoc', unsplashId: '1589553460730-df45f4474967' },
  { id: 'v12', name: 'cantho', unsplashId: '1543329064-181673830883' },
  { id: 'v13', name: 'muine', unsplashId: '1568285561501-13737b35e1d2' },
  { id: 'v14', name: 'phongnha', unsplashId: '1584483730598-a3f2d22a5789' },
  { id: 'v15', name: 'quynhon', unsplashId: '1569344448-936d934898c1' },
  { id: 'v16', name: 'lyson', unsplashId: '1524231757912-21f4fe3a7200' }, // Secondary
  { id: 'v17', name: 'hagiang', unsplashId: '1502901664414-27f4f65c92c9' },
  { id: 'v18', name: 'condao', unsplashId: '1589553460730-df45f4474967' }, // Secondary
  { id: 'v19', name: 'backan', unsplashId: '1543329064-181673830883' }, // Secondary
  { id: 'v20', name: 'mocchau', unsplashId: '1506126613408-eca07ce68773' }, // Secondary
  { id: 'v21', name: 'tayninh', unsplashId: '1549474843-ed8300454d26' }, // Secondary
  { id: 'v22', name: 'angiang', unsplashId: '1543329064-181673830883' }, // Secondary
  { id: 'v23', name: 'vungtau', unsplashId: '1542296332-2e4473faf563' }, // Secondary
  { id: 'v24', name: 'phuyen', unsplashId: '1569344448-936d934898c1' }, // Secondary
  { id: 'v25', name: 'bentre', unsplashId: '1543329064-181673830883' }, // Secondary
  { id: 'v26', name: 'langson', unsplashId: '1555921015-5532091f6026' }, // Secondary
  { id: 'v27', name: 'yenbai', unsplashId: '1506126613408-eca07ce68773' }, // Secondary
  { id: 'v28', name: 'samson', unsplashId: '1542296332-2e4473faf563' }, // Secondary
  { id: 'v29', name: 'vinhhy', unsplashId: '1567124239-550302909787' }, // Secondary
  { id: 'v30', name: 'phanthiet', unsplashId: '1568285561501-13737b35e1d2' }, // Secondary

  // JAPAN (30)
  { id: 'j-air-1', name: 'narita', unsplashId: '1556383842-290a867706e5' },
  { id: 'j-air-2', name: 'kansai', unsplashId: '1436491865332-7a61a109cc05' },
  { id: 'j-air-3', name: 'haneda', unsplashId: '1558383030-9154941061b' },
  { id: 'j1', name: 'tokyo', unsplashId: '1503899036084-c55cdd92da26' },
  { id: 'j2', name: 'kyoto', unsplashId: '1493976040374-85c8e12f0c0e' },
  { id: 'j3', name: 'osaka', unsplashId: '1590253504102-4246067756f1' },
  { id: 'j4', name: 'hokkaido', unsplashId: '1583133509310-85f0967a6d80' },
  { id: 'j5', name: 'mountfuji', unsplashId: '1509023464722-18d996393ca8' },
  { id: 'j7', name: 'nara', unsplashId: '1524413139049-108cb05ccd98' },
  { id: 'j16', name: 'shirakawago', unsplashId: '1526481280693-3bfa75ac8efd' },
  { id: 'j10', name: 'hakone', unsplashId: '1528127269322-539801943592' },
  { id: 'j11', name: 'arashiyama', unsplashId: '1540959733332-eab4deabeeaf' },
  { id: 'j12', name: 'hiroshima', unsplashId: '1552465011-b4e21bf6e79a' },
  { id: 'j13', name: 'kamakura', unsplashId: '1542931237-323a19592736' },
  { id: 'j14', name: 'nikko', unsplashId: '1505440484611-23c171ad6e96' },
  { id: 'j15', name: 'fukuoka', unsplashId: '1558862107-d49ef2a04d72' },
  { id: 'j17', name: 'takayama', unsplashId: '1598449336111-c91834246830' },
  { id: 'j18', name: 'kanazawa', unsplashId: '1503899036084-c55cdd92da26' }, // Reuse Tokyo temporarily
  { id: 'j19', name: 'beppu', unsplashId: '1555510528-97be23512e0e' },
  { id: 'j20', name: 'kagoshima', unsplashId: '1571408104523-289b533e4b7b' },
  { id: 'j21', name: 'yokohama', unsplashId: '1533050487297-09b450131914' },
  { id: 'j22', name: 'nagoya', unsplashId: '1590492477344-0b616999a093' },
  { id: 'j23', name: 'ise', unsplashId: '1590664082210-63989ca57697' },
  { id: 'j24', name: 'sendai', unsplashId: '1573059082260-843336706e23' },
  { id: 'j25', name: 'matsumoto', unsplashId: '1583093202998-6395ec69376e' },
  { id: 'j26', name: 'kumamoto', unsplashId: '1549488344-1f9b8d2bd1f3' },
  { id: 'j27', name: 'okayama', unsplashId: '1524314857205-59c9be73c7b1' },
  { id: 'j28', name: 'nagasaki', unsplashId: '1583691278013-67c4ec23521b' },
  { id: 'j29', name: 'aomori', unsplashId: '1582738411706-bfc8e691d1c2' },
  { id: 'j30', name: 'gifu', unsplashId: '1542385151-efd9000785a0' }
];

async function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filePath)).on('close', resolve);
      } else {
        res.resume();
        reject(new Error(`Failed ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log("--- INDUSTRIAL ASSET DOWNLOAD ---");
  for (const item of destinationData) {
    const url = `https://images.unsplash.com/photo-${item.unsplashId}?auto=format&fit=crop&q=80&w=800`;
    const fileName = `${item.id}.jpg`;
    const filePath = path.join(dir, fileName);
    
    try {
      if (fs.existsSync(filePath)) {
        console.log(`[EXIST] Skipping ${fileName}`);
        continue;
      }
      console.log(`[DOWN] ${item.name}...`);
      await download(url, filePath);
    } catch (e) {
      console.error(`[FAIL] ${item.name}: ${e.message}`);
    }
  }
  console.log("--- DOWNLOAD COMPLETED ---");
}

main();
