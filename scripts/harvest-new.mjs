/**
 * @file scripts/harvest-new.mjs
 * @description Sourcing and optimizing 65 new high-quality landmark images sequentially.
 * @version 1.0.0
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
  DELAY_BETWEEN_REQUESTS_MS: 1500, // Friendly delay
  MAX_RETRIES: 3,
};

const NEW_LOCATIONS = [
  // --- PHÁP (fr1 - fr5) ---
  { id: 'fr1', name: 'Tháp Eiffel', search: 'Eiffel Tower' },
  { id: 'fr2', name: 'Khải Hoàn Môn', search: 'Arc de Triomphe' },
  { id: 'fr3', name: 'Bảo tàng Louvre', search: 'Louvre' },
  { id: 'fr4', name: 'Lâu đài Versailles', search: 'Palace of Versailles' },
  { id: 'fr5', name: 'Mont Saint-Michel', search: 'Mont Saint-Michel' },

  // --- Ý (it1 - it5) ---
  { id: 'it1', name: 'Đấu trường La Mã', search: 'Colosseum Rome' },
  { id: 'it2', name: 'Tháp nghiêng Pisa', search: 'Leaning Tower of Pisa' },
  { id: 'it3', name: 'Kênh đào Venice', search: 'Grand Canal Venice' },
  { id: 'it4', name: 'Nhà thờ Florence', search: 'Florence Cathedral' },
  { id: 'it5', name: 'Bờ biển Amalfi', search: 'Amalfi Coast' },

  // --- ĐỨC (de1 - de5) ---
  { id: 'de1', name: 'Cổng Brandenburg', search: 'Brandenburg Gate' },
  { id: 'de2', name: 'Lâu đài Neuschwanstein', search: 'Neuschwanstein Castle' },
  { id: 'de3', name: 'Nhà thờ lớn Köln', search: 'Cologne Cathedral' },
  { id: 'de4', name: 'Cảng Hamburg', search: 'Port of Hamburg' },
  { id: 'de5', name: 'Rừng Đen', search: 'Black Forest Germany' },

  // --- ANH (uk1 - uk5) ---
  { id: 'uk1', name: 'Đồng hồ Big Ben', search: 'Big Ben London' },
  { id: 'uk2', name: 'Stonehenge', search: 'Stonehenge' },
  { id: 'uk3', name: 'Lâu đài Edinburgh', search: 'Edinburgh Castle' },
  { id: 'uk4', name: 'Hồ Loch Ness', search: 'Loch Ness Scotland' },
  { id: 'uk5', name: 'Cầu Tháp Luân Đôn', search: 'Tower Bridge London' },

  // --- TÂY BAN NHA (es1 - es5) ---
  { id: 'es1', name: 'Sagrada Família', search: 'Sagrada Família' },
  { id: 'es2', name: 'Cung điện Alhambra', search: 'Alhambra' },
  { id: 'es3', name: 'Plaza Mayor', search: 'Plaza Mayor Madrid' },
  { id: 'es4', name: 'Nhà thờ lớn Seville', search: 'Seville Cathedral' },
  { id: 'es5', name: 'Đảo Ibiza', search: 'Ibiza island' },

  // --- THỤY SĨ (ch1 - ch5) ---
  { id: 'ch1', name: 'Núi Matterhorn', search: 'Matterhorn' },
  { id: 'ch2', name: 'Hồ Geneva', search: 'Lake Geneva Switzerland' },
  { id: 'ch3', name: 'Phố cổ Bern', search: 'Old City of Bern' },
  { id: 'ch4', name: 'Interlaken', search: 'Interlaken' },
  { id: 'ch5', name: 'Thác Rhine', search: 'Rhine Falls' },

  // --- HÀ LAN (nl1 - nl5) ---
  { id: 'nl1', name: 'Vườn hoa Keukenhof', search: 'Keukenhof' },
  { id: 'nl2', name: 'Kênh đào Amsterdam', search: 'Canals of Amsterdam' },
  { id: 'nl3', name: 'Kinderdijk', search: 'Kinderdijk' },
  { id: 'nl4', name: 'Bảo tàng Van Gogh', search: 'Van Gogh Museum' },
  { id: 'nl5', name: 'Cảng Rotterdam', search: 'Erasmus Bridge Rotterdam' },

  // --- ÁO (at1 - at5) ---
  { id: 'at1', name: 'Cung điện Schönbrunn', search: 'Schönbrunn Palace' },
  { id: 'at2', name: 'Làng cổ Hallstatt', search: 'Hallstatt' },
  { id: 'at3', name: 'Phố cổ Salzburg', search: 'Salzburg Altstadt' },
  { id: 'at4', name: 'Alps Innsbruck', search: 'Innsbruck Nordkette' },
  { id: 'at5', name: 'Opera Quốc gia Vienna', search: 'Vienna State Opera' },

  // --- HY LẠP (gr1 - gr5) ---
  { id: 'gr1', name: 'Acropolis', search: 'Acropolis of Athens' },
  { id: 'gr2', name: 'Đảo Santorini', search: 'Santorini Caldera' },
  { id: 'gr3', name: 'Tu viện Meteora', search: 'Meteora Greece' },
  { id: 'gr4', name: 'Đảo Mykonos', search: 'Mykonos windmills' },
  { id: 'gr5', name: 'Di tích Delphi', search: 'Delphi Greece' },

  // --- THỔ NHĨ KỲ (tr1 - tr5) ---
  { id: 'tr1', name: 'Hagia Sophia', search: 'Hagia Sophia Istanbul' },
  { id: 'tr2', name: 'Cappadocia', search: 'Cappadocia' },
  { id: 'tr3', name: 'Pamukkale', search: 'Pamukkale' },
  { id: 'tr4', name: 'Ephesus', search: 'Ephesus Turkey' },
  { id: 'tr5', name: 'Eo biển Bosphorus', search: 'Bosphorus Bridge' },

  // --- TRUNG QUỐC (cn1 - cn5) ---
  { id: 'cn1', name: 'Vạn Lý Trường Thành', search: 'Great Wall of China Mutianyu' },
  { id: 'cn2', name: 'Tử Cấm Thành', search: 'Forbidden City Beijing' },
  { id: 'cn3', name: 'Đội quân đất nung', search: 'Terracotta Army Xi an' },
  { id: 'cn4', name: 'Bến Thượng Hải', search: 'The Bund Shanghai' },
  { id: 'cn5', name: 'Trương Gia Giới', search: 'Zhangjiajie National Forest Park' },

  // --- HÀ N QUỐC (kr1 - kr5) ---
  { id: 'kr1', name: 'Cung điện Gyeongbokgung', search: 'Gyeongbokgung Palace' },
  { id: 'kr2', name: 'Đảo Jeju', search: 'Jeju Island Seongsan Ilchulbong' },
  { id: 'kr3', name: 'Tháp Namsan Seoul', search: 'N Seoul Tower' },
  { id: 'kr4', name: 'Làng Bukchon Hanok', search: 'Bukchon Hanok Village' },
  { id: 'kr5', name: 'Bãi biển Haeundae', search: 'Haeundae Beach' },

  // --- ĐÀI LOAN (tw1 - tw5) ---
  { id: 'tw1', name: 'Tháp Taipei 101', search: 'Taipei 101' },
  { id: 'tw2', name: 'Hồ Nhật Nguyệt', search: 'Sun Moon Lake' },
  { id: 'tw3', name: 'Phố cổ Cửu Phần', search: 'Jiufen' },
  { id: 'tw4', name: 'Vườn quốc gia Taroko', search: 'Taroko Gorge' },
  { id: 'tw5', name: 'Chợ đêm Sĩ Lâm', search: 'Shilin Night Market' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getOriginalUrl(url) {
  if (url.includes('/commons/thumb/')) {
    const parts = url.split('/');
    const newParts = parts.filter((p, index) => index !== 5 && index !== parts.length - 1);
    return newParts.join('/');
  }
  return url;
}

async function fetchWikipediaImage(searchQuery, lang = 'en') {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=1200&format=json`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TravelAppBot/2.0 (contact@travelapp.com; admin@travelapp.com) MobileApp/1.0'
      }
    });
    const data = await res.json();
    if (data.query && data.query.pages) {
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];
      if (page.thumbnail && page.thumbnail.source) {
        return page.thumbnail.source;
      }
    }
  } catch (e) {
    console.error(`Wikipedia search error for ${searchQuery} on lang ${lang}:`, e.message);
  }
  return null;
}

async function fetchCommonsImage(searchQuery) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&format=json`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TravelAppBot/2.0 (contact@travelapp.com; admin@travelapp.com) MobileApp/1.0'
      }
    });
    const data = await res.json();
    if (data.query && data.query.pages) {
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];
      const info = page.imageinfo?.[0];
      if (info && info.url) {
        return info.url;
      }
    }
  } catch (e) {
    console.error(`Commons search error for ${searchQuery}:`, e.message);
  }
  return null;
}

async function getBestImage(item) {
  let imgUrl = await fetchWikipediaImage(item.search, 'en');
  if (!imgUrl) {
    imgUrl = await fetchCommonsImage(item.search);
  }
  if (!imgUrl) {
    imgUrl = await fetchWikipediaImage(item.search, 'vi');
  }
  return imgUrl;
}

async function processImage(id, name, url, attempt = 1) {
  const tempPath = path.join(CONFIG.OUTPUT_DIR, `temp_${id}.jpg`);
  const finalPath = path.join(CONFIG.OUTPUT_DIR, `${id}.jpg`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    console.log(`Downloading ${id} (${name}) from: ${url}`);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TravelApp/3.0' 
      }
    });
    clearTimeout(timeoutId);

    if (response.status === 429) {
      if (attempt <= CONFIG.MAX_RETRIES) {
        const backoff = attempt * 4000;
        console.log(`[ RATE LIMIT 429 ] ${id.toUpperCase()} -> Waiting ${backoff / 1000}s before retry ${attempt}/${CONFIG.MAX_RETRIES}...`);
        await sleep(backoff);
        return await processImage(id, name, url, attempt + 1);
      }
      throw new Error(`HTTP 429 Rate Limit exceeded after ${CONFIG.MAX_RETRIES} retries`);
    }

    if (!response.ok) {
      if (response.status === 404 && url.includes('/commons/thumb/')) {
        const originalUrl = getOriginalUrl(url);
        console.log(`[ 404 ON THUMB ] Trying original file URL: ${originalUrl}`);
        return await processImage(id, name, originalUrl, attempt);
      }
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
  console.log(" STARTING NEW SEQUENTIAL IMAGE HARVESTING: 65 NEW DESTINATIONS");
  console.log("==================================================================");

  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

  const auditLog = [];

  for (let i = 0; i < NEW_LOCATIONS.length; i++) {
    const item = NEW_LOCATIONS[i];
    console.log(`[${i + 1}/65] Resolving URL for: ${item.id.toUpperCase()} (${item.name})...`);
    
    const url = await getBestImage(item);
    
    if (url) {
      const success = await processImage(item.id, item.name, url);
      auditLog.push({ id: item.id, name: item.name, status: success ? 'SUCCESS' : 'DOWNLOAD_FAILED', url });
    } else {
      console.error(`[ NOT FOUND ] ${item.id.toUpperCase()} -> ${item.name}`);
      auditLog.push({ id: item.id, name: item.name, status: 'URL_NOT_FOUND', url: 'N/A' });
    }

    await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);
  }

  let report = `# NEW LANDMARK IMAGES HARVEST REPORT\n\n`;
  report += `Generated at: ${new Date().toISOString()}\n\n`;
  report += `| ID | Tên địa danh | Trạng thái | Nguồn hình ảnh |\n`;
  report += `|----|--------------|------------|----------------|\n`;
  for (const log of auditLog) {
    report += `| ${log.id} | ${log.name} | ${log.status} | [Link](${log.url}) |\n`;
  }
  await fs.writeFile(path.join(process.cwd(), 'IMAGE_NEW_HARVEST_LOG.md'), report, 'utf8');

  console.log("==================================================================");
  console.log(" HARVEST COMPLETE. Audit report saved to IMAGE_NEW_HARVEST_LOG.md");
  console.log("==================================================================");
}

main().catch(console.error);
