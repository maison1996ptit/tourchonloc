import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const filePath = path.join(dir, 'about-bg.jpg');

// Elegant, minimal, dark abstract background with soft flowing curves
const targetUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80';
const fallbackUrl = 'https://images.pexels.com/photos/7135037/pexels-photo-7135037.jpeg?auto=compress&cs=tinysrgb&w=1920';

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, dest).then(resolve).catch(reject);
      } else if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log("Downloading minimal abstract background...");
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  try {
    await download(targetUrl, filePath);
    const stats = fs.statSync(filePath);
    if (stats.size > 10000) {
      console.log("[OK] Primary background downloaded.");
      return;
    }
  } catch (error) {
    console.error("[FAIL] Primary failed:", error.message);
  }

  console.log("Trying fallback abstract background...");
  try {
    await download(fallbackUrl, filePath);
    console.log("[OK] Fallback abstract background saved.");
  } catch (err) {
    console.error("[CRITICAL FAIL] Both downloads failed.");
  }
}

main();
