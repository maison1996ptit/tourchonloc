/**
 * @file scripts/harvest-new-all.mjs
 * @description Sequentially downloads and optimizes all 520 new landmark images generated in the manifest.
 * @version 1.0.0
 * @author Antigravity AI
 */

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

const CONFIG = {
  MANIFEST_FILE: path.join(process.cwd(), 'scripts', 'harvest-manifest.json'),
  OUTPUT_DIR: path.join(process.cwd(), 'public', 'images', 'guides'),
  IMAGE_WIDTH: 1200,
  IMAGE_HEIGHT: 750,
  TIMEOUT_MS: 30000,
  DELAY_BETWEEN_REQUESTS_MS: 1200, // Throttling delay
  MAX_RETRIES: 3,
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getOriginalUrl(url) {
  if (url.includes('/commons/thumb/')) {
    const parts = url.split('/');
    const newParts = parts.filter((p, index) => index !== 5 && index !== parts.length - 1);
    return newParts.join('/');
  }
  return url;
}

async function processImage(id, name, url, attempt = 1) {
  const tempPath = path.join(CONFIG.OUTPUT_DIR, `temp_${id}.jpg`);
  const finalPath = path.join(CONFIG.OUTPUT_DIR, `${id}.jpg`);

  // Ensure output file doesn't already exist or download it
  try {
    const stats = await fs.stat(finalPath);
    if (stats.size > 1000) {
      console.log(`[ SKIP ] ${id.toUpperCase()} -> ${name} already exists.`);
      return true;
    }
  } catch {}

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 
        'User-Agent': 'TravelAppBot/3.0 (admin@travelapp.com; contact@travelapp.com)' 
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
  console.log(" STARTING DOWNLOAD OF ALL 520 NEW LANDMARK IMAGES ");
  console.log("==================================================================");

  let manifestData;
  try {
    const raw = await fs.readFile(CONFIG.MANIFEST_FILE, 'utf8');
    manifestData = JSON.parse(raw);
  } catch (e) {
    console.error("Error reading manifest file. Make sure generate-40-landmarks.mjs completed successfully first.", e.message);
    process.exit(1);
  }

  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

  const auditLog = [];

  for (let i = 0; i < manifestData.length; i++) {
    const item = manifestData[i];
    console.log(`[${i + 1}/${manifestData.length}] Downloading: ${item.id.toUpperCase()} (${item.name})...`);
    
    if (item.url) {
      const success = await processImage(item.id, item.name, item.url);
      auditLog.push({ id: item.id, name: item.name, status: success ? 'SUCCESS' : 'DOWNLOAD_FAILED', url: item.url });
    } else {
      console.error(`[ NO URL ] ${item.id.toUpperCase()} -> ${item.name}`);
      auditLog.push({ id: item.id, name: item.name, status: 'URL_NOT_FOUND', url: 'N/A' });
    }

    await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);
  }

  let report = `# ALL NEW 520 LANDMARKS DOWNLOAD REPORT\n\n`;
  report += `Generated at: ${new Date().toISOString()}\n\n`;
  report += `| ID | Tên địa danh | Trạng thái | Nguồn hình ảnh |\n`;
  report += `|----|--------------|------------|----------------|\n`;
  for (const log of auditLog) {
    report += `| ${log.id} | ${log.name} | ${log.status} | [Link](${log.url}) |\n`;
  }
  await fs.writeFile(path.join(process.cwd(), 'IMAGE_520_HARVEST_LOG.md'), report, 'utf8');

  console.log("==================================================================");
  console.log(" DOWNLOAD COMPLETE. Report saved to IMAGE_520_HARVEST_LOG.md");
  console.log("==================================================================");
}

main().catch(console.error);
