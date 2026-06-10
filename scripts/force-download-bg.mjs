import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = path.join(process.cwd(), 'public/images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const filePath = path.join(dir, 'about-bg.jpg');

// A list of highly reliable, stunning landscape images (Ha Giang / Vietnam / Mountains) from Pexels
const urls = [
  'https://images.pexels.com/photos/5690858/pexels-photo-5690858.jpeg?auto=compress&cs=tinysrgb&w=1920', // Ha Giang
  'https://images.pexels.com/photos/3371661/pexels-photo-3371661.jpeg?auto=compress&cs=tinysrgb&w=1920', // Vietnam landscape
  'https://images.pexels.com/photos/10090487/pexels-photo-10090487.jpeg?auto=compress&cs=tinysrgb&w=1920', // Mountains
  'https://images.pexels.com/photos/1624538/pexels-photo-1624538.jpeg?auto=compress&cs=tinysrgb&w=1920'  // Sapa
];

function download(url, dest) {
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
  console.log("Attempting to download a beautiful background image...");
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // Delete old file
  }

  for (const url of urls) {
    try {
      console.log(`Trying: ${url.split('?')[0]}`);
      await download(url, filePath);
      
      const stats = fs.statSync(filePath);
      if (stats.size > 10000) { // Ensure it's not an empty or error file
        console.log(`[SUCCESS] Downloaded image! Size: ${Math.round(stats.size / 1024)} KB`);
        return; // Exit on success
      } else {
        console.log(`[WARNING] File too small (${stats.size} bytes), might be an error page. Trying next...`);
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error(`[FAIL] ${e.message}`);
    }
  }
  
  console.error("[CRITICAL] All image downloads failed.");
}

main();
