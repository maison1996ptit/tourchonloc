import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images/guides');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const surgical = [
  { id: 'v2', url: 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?auto=format&fit=crop&w=800&q=80' },
  { id: 'v12', url: 'https://images.unsplash.com/photo-1561350111-7daa4f284bc6?auto=format&fit=crop&w=800&q=80' },
  { id: 'v13', url: 'https://images.unsplash.com/photo-1506197357084-58ba3df8058c?auto=format&fit=crop&w=800&q=80' },
  { id: 'v34', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80' },
  { id: 'v38', url: 'https://images.unsplash.com/photo-1505069190533-da1c9af13346?auto=format&fit=crop&w=800&q=80' },
  { id: 'j7', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80' },
  { id: 'j13', url: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80' },
  { id: 'j17', url: 'https://images.unsplash.com/photo-1590273466070-40c466b4432c?auto=format&fit=crop&w=800&q=80' },
  { id: 'j18', url: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=800&q=80' },
  { id: 'j19', url: 'https://images.unsplash.com/photo-1576675466684-456bcdecc5df?auto=format&fit=crop&w=800&q=80' },
  { id: 'j20', url: 'https://images.unsplash.com/photo-1505069190533-da1c9af13346?auto=format&fit=crop&w=800&q=80' },
  { id: 'j21', url: 'https://images.unsplash.com/photo-1555990331-8699e8992394?auto=format&fit=crop&w=800&q=80' },
  { id: 'j22', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
  { id: 'j23', url: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&w=800&q=80' },
  { id: 'j24', url: 'https://images.unsplash.com/photo-1589140417646-778912e75e9b?auto=format&fit=crop&w=800&q=80' },
  { id: 'j25', url: 'https://images.unsplash.com/photo-1569085815151-efd9000785a0?auto=format&fit=crop&w=800&q=80' },
  { id: 'j26', url: 'https://images.unsplash.com/photo-1605335165551-78c77508491d?auto=format&fit=crop&w=800&q=80' },
  { id: 'j28', url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80' },
  { id: 'j29', url: 'https://images.unsplash.com/photo-1544085311-12102723c469?auto=format&fit=crop&w=800&q=80' },
  { id: 'j31', url: 'https://images.unsplash.com/photo-1551041484-2594a61c69b5?auto=format&fit=crop&w=800&q=80' }
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
  console.log("--- FINAL SURGICAL STRIKE ---");
  for (const item of surgical) {
    const filePath = path.join(dir, `${item.id}.jpg`);
    try {
      await download(item.url, filePath);
      console.log(`[OK] ${item.id}`);
    } catch (e) {
      console.error(`[FAIL] ${item.id}: ${e.message}`);
    }
  }
}
main();
