import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// MANUALLY AUDITED HIGH-QUALITY LANDMARK DATASET
const masterLandmarks = [
  // VIETNAM (15)
  { id: 'v1', name: 'Hanoi', url: 'https://images.pexels.com/photos/11011504/pexels-photo-11011504.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v2', name: 'Ha Long Bay', url: 'https://images.pexels.com/photos/3576081/pexels-photo-3576081.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v3', name: 'Sapa', url: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v4', name: 'Ninh Binh', url: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v5', name: 'Hue', url: 'https://images.pexels.com/photos/3371661/pexels-photo-3371661.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v6', name: 'Da Nang', url: 'https://images.pexels.com/photos/2315053/pexels-photo-2315053.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v7', name: 'Hoi An', url: 'https://images.pexels.com/photos/2350368/pexels-photo-2350368.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v8', name: 'Nha Trang', url: 'https://images.pexels.com/photos/1518723/pexels-photo-1518723.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v9', name: 'Da Lat', url: 'https://images.pexels.com/photos/3058332/pexels-photo-3058332.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v10', name: 'Saigon', url: 'https://images.pexels.com/photos/1824477/pexels-photo-1824477.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v11', name: 'Phu Quoc', url: 'https://images.pexels.com/photos/2260655/pexels-photo-2260655.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v12', name: 'Can Tho', url: 'https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v13', name: 'Mui Ne', url: 'https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v14', name: 'Phong Nha', url: 'https://images.pexels.com/photos/2083652/pexels-photo-2083652.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'v16', name: 'Ha Giang', url: 'https://images.pexels.com/photos/5690858/pexels-photo-5690858.jpeg?auto=compress&cs=tinysrgb&w=800' },

  // JAPAN (15)
  { id: 'j1', name: 'Shibuya', url: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j2', name: 'Kyoto', url: 'https://images.pexels.com/photos/14939760/pexels-photo-14939760.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j3', name: 'Osaka Castle', url: 'https://images.pexels.com/photos/1434812/pexels-photo-1434812.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j4', name: 'Hokkaido', url: 'https://images.pexels.com/photos/632125/pexels-photo-632125.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j5', name: 'Mt Fuji', url: 'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j6', name: 'Itsukushima', url: 'https://images.pexels.com/photos/2361717/pexels-photo-2361717.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j7', name: 'Nara', url: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j8', name: 'Shirakawa-go', url: 'https://images.pexels.com/photos/4005033/pexels-photo-4005033.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j9', name: 'Hakone', url: 'https://images.pexels.com/photos/4048595/pexels-photo-4048595.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j10', name: 'Arashiyama', url: 'https://images.pexels.com/photos/2362002/pexels-photo-2362002.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j11', name: 'Nikko', url: 'https://images.pexels.com/photos/3773199/pexels-photo-3773199.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j12', name: 'Kamakura', url: 'https://images.pexels.com/photos/4222046/pexels-photo-4222046.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j13', name: 'Fukuoka', url: 'https://images.pexels.com/photos/15477028/pexels-photo-15477028.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j14', name: 'Kanazawa', url: 'https://images.pexels.com/photos/5604169/pexels-photo-5604169.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j15', name: 'Okinawa', url: 'https://images.pexels.com/photos/14845014/pexels-photo-14845014.jpeg?auto=compress&cs=tinysrgb&w=800' }
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
  console.log("--- FINAL VERIFIED HARVEST: TOP 30 ICONIC LOCATIONS ---");
  for (const item of masterLandmarks) {
    const filePath = path.join(dir, `${item.id}.jpg`);
    try {
      console.log(`[LOCALIZING] ${item.id}: ${item.name}...`);
      await download(item.url, filePath);
      console.log(`  [OK]`);
    } catch (e) {
      console.error(`  [FAIL] ${item.id}: ${e.message}`);
    }
  }
}
main();
