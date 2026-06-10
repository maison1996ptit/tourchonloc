/**
 * @file scripts/harvest-authentic-sequential.mjs
 * @description Sourcing 80 100% authentic, high-quality landmark images sequentially with retry logic and delays to prevent rate limiting.
 * @version 2.1.0
 * @author Antigravity AI
 */

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

const CONFIG = {
  OUTPUT_DIR: path.join(process.cwd(), 'public', 'images', 'guides'),
  IMAGE_WIDTH: 1200,
  IMAGE_HEIGHT: 750, // 16:10 ratio for Card UI
  TIMEOUT_MS: 30000,
  DELAY_BETWEEN_REQUESTS_MS: 1500, // 1.5s delay to be friendly to Wikimedia
  MAX_RETRIES: 3,
};

const VN_LOCATIONS = [
  { id: 'v1', name: 'Hà Nội', search: 'Hồ Hoàn Kiếm' },
  { id: 'v2', name: 'Vịnh Hạ Long', search: 'Vịnh Hạ Long' },
  { id: 'v3', name: 'Sapa', search: 'Sa Pa' },
  { id: 'v4', name: 'Ninh Bình', search: 'Tràng An' },
  { id: 'v5', name: 'Huế', search: 'Kinh thành Huế' },
  { id: 'v6', name: 'Đà Nẵng', search: 'Dragon Bridge Da Nang' },
  { id: 'v7', name: 'Hội An', search: 'Phố cổ Hội An' },
  { id: 'v8', name: 'Nha Trang', search: 'Vịnh Nha Trang' },
  { id: 'v9', name: 'Đà Lạt', search: 'Đà Lạt' },
  { id: 'v10', name: 'TP. Hồ Chí Minh', search: 'Nhà thờ Đức Bà Sài Gòn' },
  { id: 'v11', name: 'Phú Quốc', search: 'Phú Quốc' },
  { id: 'v12', name: 'Cần Thơ', search: 'Chợ nổi Cái Răng' },
  { id: 'v13', name: 'Mũi Né', search: 'Mũi Né' },
  { id: 'v14', name: 'Phong Nha', search: 'Động Phong Nha' },
  { id: 'v15', name: 'Hà Giang', search: 'Mã Pí Lèng' },
  { id: 'v16', name: 'Côn Đảo', search: 'Côn Đảo' },
  { id: 'v17', name: 'Buôn Ma Thuột', search: 'Thác Đray Nur' },
  { id: 'v18', name: 'Mỹ Sơn', search: 'Thánh địa Mỹ Sơn' },
  { id: 'v19', name: 'Tây Ninh', search: 'Núi Bà Đen' },
  { id: 'v20', name: 'Vũng Tàu', search: 'Bạch Dinh' },
  { id: 'v21', name: 'Hồ Ba Bể', search: 'Hồ Ba Bể' },
  { id: 'v22', name: 'Lạng Sơn', search: 'Mẫu Sơn' },
  { id: 'v23', name: 'Thác Bản Giốc', search: 'Thác Bản Giốc' },
  { id: 'v24', name: 'Mù Cang Chải', search: 'Ruộng bậc thang Mù Cang Chải' },
  { id: 'v25', name: 'Điện Biên Phủ', search: 'Chiến dịch Điện Biên Phủ' },
  { id: 'v26', name: 'Mộc Châu', search: 'Đồi chè Mộc Châu' },
  { id: 'v27', name: 'Cát Bà', search: 'Vịnh Lan Hạ' },
  { id: 'v28', name: 'Tam Cốc', search: 'Tam Cốc - Bích Động' },
  { id: 'v29', name: 'Chùa Tam Chúc', search: 'Hồ Tam Chúc' },
  { id: 'v30', name: 'Chùa Bái Đính', search: 'Chùa Bái Đính' },
  { id: 'v31', name: 'Đỉnh Fansipan', search: 'Fansipan' },
  { id: 'v32', name: 'Ba Na Hills', search: 'Golden Bridge at Ba Na Hills' },
  { id: 'v33', name: 'Kỳ Co', search: 'Ky Co' },
  { id: 'v34', name: 'Eo Gió', search: 'Eo Gió - Nhơn Lý' },
  { id: 'v35', name: 'Lý Sơn', search: 'Đảo Lý Sơn' },
  { id: 'v36', name: 'Ghềnh Đá Đĩa', search: 'Gành Đá Đĩa' },
  { id: 'v37', name: 'Bàu Trắng', search: 'Bàu Trắng' },
  { id: 'v38', name: 'Châu Đốc', search: 'Miếu Bà Chúa Xứ Núi Sam' },
  { id: 'v39', name: 'Đất Mũi', search: 'Mũi Cà Mau' },
  { id: 'v40', name: 'Hà Tiên', search: 'Thạch Động' }
];

const JP_LOCATIONS = [
  { id: 'j1', name: 'Tokyo', search: 'Shibuya Crossing' },
  { id: 'j2', name: 'Kyoto', search: 'Kinkaku-ji' },
  { id: 'j3', name: 'Osaka', search: 'Osaka Castle' },
  { id: 'j4', name: 'Hokkaido', search: 'Hokkaido winter' },
  { id: 'j5', name: 'Núi Phú Sĩ', search: 'Mount Fuji' },
  { id: 'j6', name: 'Itsukushima', search: 'Itsukushima Shrine' },
  { id: 'j7', name: 'Nara', search: 'Nara Park' },
  { id: 'j8', name: 'Shirakawa-go', search: 'Historic Villages of Shirakawa-gō and Gokayama' },
  { id: 'j9', name: 'Hakone', search: 'Hakone Shrine' },
  { id: 'j10', name: 'Arashiyama', search: 'Arashiyama Bamboo Grove' },
  { id: 'j11', name: 'Nikko', search: 'Nikkō Tōshō-gū' },
  { id: 'j12', name: 'Kamakura', search: 'Kōtoku-in' },
  { id: 'j13', name: 'Fukuoka', search: 'Yomise(Yatai)' },
  { id: 'j14', name: 'Kanazawa', search: 'Kenroku-en' },
  { id: 'j15', name: 'Okinawa', search: 'Okinawa Island' },
  { id: 'j16', name: 'Yokohama', search: 'Minato Mirai 21' },
  { id: 'j17', name: 'Nagoya', search: 'Nagoya Castle' },
  { id: 'j18', name: 'Sendai', search: 'Sendai Castle' },
  { id: 'j19', name: 'Sapporo', search: 'Sapporo Odori Park' },
  { id: 'j20', name: 'Kobe', search: 'Kobe Port Tower' },
  { id: 'j21', name: 'Hiroshima', search: 'Hiroshima Peace Memorial' },
  { id: 'j22', name: 'Nagasaki', search: 'Glover House' },
  { id: 'j23', name: 'Kumamoto', search: 'Kumamoto Castle' },
  { id: 'j24', name: 'Okayama', search: 'Kōraku-en' },
  { id: 'j25', name: 'Takayama', search: 'Takayama, Gifu' },
  { id: 'j26', name: 'Matsumoto', search: 'Matsumoto Castle' },
  { id: 'j27', name: 'Ise', search: 'Ise Grand Shrine' },
  { id: 'j28', name: 'Beppu', search: 'Beppu Onsen' },
  { id: 'j29', name: 'Kagoshima', search: 'Sakurajima' },
  { id: 'j30', name: 'Aomori', search: 'Nebuta Museum Wa Rasse' },
  { id: 'j31', name: 'Gifu', search: 'Gifu Castle' },
  { id: 'j32', name: 'Nagano', search: 'Zenkō-ji' },
  { id: 'j33', name: 'Shizuoka', search: 'Nihondaira' },
  { id: 'j34', name: 'Toyama', search: 'Toyama Castle' },
  { id: 'j35', name: 'Morioka', search: 'Morioka Castle' },
  { id: 'j36', name: 'Akita', search: 'Kubota Castle' },
  { id: 'j37', name: 'Yamagata', search: 'Yamadera' },
  { id: 'j38', name: 'Niigata', search: 'Niigata City' },
  { id: 'j39', name: 'Matsuyama', search: 'Dōgo Onsen' },
  { id: 'j40', name: 'Kochi', search: 'Kōchi Castle' }
];

const DATASET = [
  ...VN_LOCATIONS.map(item => ({ ...item, isVn: true })),
  ...JP_LOCATIONS.map(item => ({ ...item, isVn: false }))
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWikipediaImage(searchQuery, lang = 'vi') {
  const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=1&format=json`;
  try {
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TravelAppBot/2.0' }
    });
    const searchData = await searchRes.json();
    if (searchData.query?.search?.[0]) {
      const pageTitle = searchData.query.search[0].title;
      const imageUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&piprop=thumbnail&pithumbsize=1200&format=json`;
      const imgRes = await fetch(imageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TravelAppBot/2.0' }
      });
      const imgData = await imgRes.json();
      const pages = imgData.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        if (page.thumbnail?.source) {
          return page.thumbnail.source;
        }
      }
    }
  } catch (e) {
    // Fail silently
  }
  return null;
}

async function getBestImage(item) {
  let imgUrl = null;
  // Friendly delay between API lookups too
  await sleep(300);
  if (item.isVn) {
    imgUrl = await fetchWikipediaImage(item.search, 'vi');
    if (!imgUrl) {
      imgUrl = await fetchWikipediaImage(item.search, 'en');
    }
  } else {
    imgUrl = await fetchWikipediaImage(item.search, 'en');
    if (!imgUrl) {
      imgUrl = await fetchWikipediaImage(item.search, 'ja');
    }
  }
  return imgUrl;
}

async function processImage(id, name, url, attempt = 1) {
  const tempPath = path.join(CONFIG.OUTPUT_DIR, `temp_${id}.jpg`);
  const finalPath = path.join(CONFIG.OUTPUT_DIR, `${id}.jpg`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      }
    });
    clearTimeout(timeoutId);

    if (response.status === 429) {
      if (attempt <= CONFIG.MAX_RETRIES) {
        const backoff = attempt * 3000;
        console.log(`[ RATE LIMIT 429 ] ${id.toUpperCase()} -> Waiting ${backoff / 1000}s before retry ${attempt}/${CONFIG.MAX_RETRIES}...`);
        await sleep(backoff);
        return await processImage(id, name, url, attempt + 1);
      }
      throw new Error(`HTTP 429 Rate Limit exceeded after ${CONFIG.MAX_RETRIES} retries`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    await pipeline(response.body, createWriteStream(tempPath));

    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch (e) {}

    if (sharp) {
      await sharp(tempPath)
        .resize({
          width: CONFIG.IMAGE_WIDTH,
          height: CONFIG.IMAGE_HEIGHT,
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(finalPath);
      await fs.unlink(tempPath);
      console.log(`[ SUCCESS ] ${id.toUpperCase()} -> ${name} (Sharp Optimized)`);
    } else {
      await fs.rename(tempPath, finalPath);
      console.log(`[ WARN - NO SHARP ] ${id.toUpperCase()} -> ${name} (Raw Saved)`);
    }
    return true;
  } catch (e) {
    clearTimeout(timeoutId);
    console.error(`[ FAILED ] ${id.toUpperCase()} -> ${name} (Attempt ${attempt}): ${e.message}`);
    
    // Clean up temp file
    try {
      await fs.unlink(tempPath);
    } catch {}

    if (attempt <= CONFIG.MAX_RETRIES && e.message !== 'HTTP 404') {
      const backoff = attempt * 2000;
      console.log(`[ RETRYING ] ${id.toUpperCase()} -> Waiting ${backoff / 1000}s...`);
      await sleep(backoff);
      return await processImage(id, name, url, attempt + 1);
    }
    return false;
  }
}

async function main() {
  console.log("==================================================================");
  console.log(" STARTING SEQUENTIAL AUTHENTIC IMAGE HARVESTING: 80 DESTINATIONS");
  console.log("==================================================================");

  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

  const auditLog = [];

  for (let i = 0; i < DATASET.length; i++) {
    const item = DATASET[i];
    console.log(`[${i + 1}/80] Resolving URL for: ${item.id.toUpperCase()} (${item.name})...`);
    
    // Always download to overwrite incorrect files
    const finalPath = path.join(CONFIG.OUTPUT_DIR, `${item.id}.jpg`);

    const url = await getBestImage(item);
    
    if (url) {
      const success = await processImage(item.id, item.name, url);
      auditLog.push({ id: item.id, name: item.name, status: success ? 'SUCCESS' : 'DOWNLOAD_FAILED', url });
    } else {
      console.error(`[ NOT FOUND ] ${item.id.toUpperCase()} -> ${item.name}`);
      auditLog.push({ id: item.id, name: item.name, status: 'URL_NOT_FOUND', url: 'N/A' });
    }

    // Add a delay between each landmark processing to be extremely friendly to servers
    await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);
  }

  // Write audit report
  let report = `# AUTHENTIC LANDMARK IMAGES HARVEST REPORT (SEQUENTIAL)\n\n`;
  report += `Generated at: ${new Date().toISOString()}\n\n`;
  report += `| ID | Tên địa danh | Trạng thái | Nguồn hình ảnh |\n`;
  report += `|----|--------------|------------|----------------|\n`;
  for (const log of auditLog.sort((a,b) => a.id.localeCompare(b.id))) {
    report += `| ${log.id} | ${log.name} | ${log.status} | [Link](${log.url}) |\n`;
  }
  await fs.writeFile(path.join(process.cwd(), 'IMAGE_AUTHENTIC_HARVEST_LOG.md'), report, 'utf8');

  console.log("==================================================================");
  console.log(" HARVEST COMPLETE. Audit report saved to IMAGE_AUTHENTIC_HARVEST_LOG.md");
  console.log("==================================================================");
}

main().catch(console.error);
