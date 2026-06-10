/**
 * @file scripts/harvest-patch.mjs
 * @description Patch script to download and optimize the remaining failed landmark images.
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
  IMAGE_HEIGHT: 750,
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 5,
};

const PATCH_DATASET = [
  { id: 'j33', name: 'Shizuoka', url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Nihondaira_View.jpg' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processImage(id, name, url, attempt = 1) {
  const tempPath = path.join(CONFIG.OUTPUT_DIR, `temp_${id}.jpg`);
  const finalPath = path.join(CONFIG.OUTPUT_DIR, `${id}.jpg`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' 
      }
    });
    clearTimeout(timeoutId);

    if (response.status === 429) {
      if (attempt <= CONFIG.MAX_RETRIES) {
        const backoff = attempt * 5000;
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
      const backoff = attempt * 4000;
      console.log(`[ RETRYING ] ${id.toUpperCase()} -> Waiting ${backoff / 1000}s...`);
      await sleep(backoff);
      return await processImage(id, name, url, attempt + 1);
    }
    return false;
  }
}

async function main() {
  console.log("==================================================================");
  console.log(" STARTING PATCH HARVEST: 5 REMAINING IMAGES");
  console.log("==================================================================");

  for (let i = 0; i < PATCH_DATASET.length; i++) {
    const item = PATCH_DATASET[i];
    console.log(`[${i + 1}/${PATCH_DATASET.length}] Patching: ${item.id.toUpperCase()} (${item.name})...`);
    await processImage(item.id, item.name, item.url);
    await sleep(3000); // 3-second delay to be extremely friendly
  }
  console.log("==================================================================");
  console.log(" PATCH HARVEST COMPLETE.");
  console.log("==================================================================");
}

main().catch(console.error);
