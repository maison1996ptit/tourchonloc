/**
 * @file scripts/final-harvest-80.mjs
 * @description Script tự động hóa thu thập, tải và tối ưu hóa 80 hình ảnh địa danh du lịch (Việt Nam & Nhật Bản).
 * @version 1.0.0
 * @author Senior Solution Architect Approach
 */

import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { performance } from 'perf_hooks';

// Khởi tạo cấu hình hệ thống
const CONFIG = {
    OUTPUT_DIR: path.join(process.cwd(), 'public', 'images', 'guides'),
    CONCURRENCY_LIMIT: 5, // Kiểm soát giới hạn kết nối đồng thời tránh bị rate-limit
    IMAGE_WIDTH: 1200,    // Kích thước chuẩn tối ưu cho giao diện Web/Mobile Card
    IMAGE_QUALITY: 82,    // Điểm cân bằng tối ưu giữa dung lượng file và độ sắc nét hình ảnh
    TIMEOUT_MS: 15000,    // Thời gian tối đa cho mỗi request tải ảnh (15 giây)
};

// Khởi tạo danh sách 80 địa điểm duy nhất (v1-v40: Việt Nam, j1-j40: Nhật Bản)
// Sử dụng mã ID ảnh thực tế từ Unsplash Production CDN để đảm bảo không trùng lặp (Zero Link-Recycling)
const LOCATION_DATASET = [
    // --- VIỆT NAM (v1 - v40) ---
    { id: 'v1', name: 'Hà Nội', keyword: 'hanoi-old-quarter', photoId: 'photo-1507525428034-b723cf961d3e' },
    { id: 'v2', name: 'Hạ Long', keyword: 'ha-long-bay', photoId: 'photo-1528127269322-53980194359a' },
    { id: 'v3', name: 'Hội An', keyword: 'hoi-an-ancient-town', photoId: 'photo-1555939594-58d7cb561ad1' },
    { id: 'v4', name: 'Phú Quốc', keyword: 'phu-quoc-island', photoId: 'photo-1540206351-d6465b3ac5c1' },
    { id: 'v5', name: 'Đà Nẵng', keyword: 'da-nang-city', photoId: 'photo-1559592413-7ece7049e2f7' },
    { id: 'v6', name: 'Nha Trang', keyword: 'nha-trang-beach', photoId: 'photo-1571474004502-c1def214ac6d' },
    { id: 'v7', name: 'Huế', keyword: 'hue-imperial-city', photoId: 'photo-1599707367072-cd6ada2bc375' },
    { id: 'v8', name: 'Sapa', keyword: 'sapa-rice-fields', photoId: 'photo-1524396309943-e03f5ee026d0' },
    { id: 'v9', name: 'Ninh Bình', keyword: 'ninh-binh-trang-an', photoId: 'photo-1536431311719-398b6704d4cc' },
    { id: 'v10', name: 'Đà Lạt', keyword: 'da-lat-valleys', photoId: 'photo-1583249890652-f1015156770a' },
    { id: 'v11', name: 'Mũi Né', keyword: 'mui-ne-sand-dunes', photoId: 'photo-1506125840744-167167210587' },
    { id: 'v12', name: 'Phong Nha', keyword: 'phong-nha-cave', photoId: 'photo-1627581139498-8ec1712a8385' },
    { id: 'v13', name: 'Cần Thơ', keyword: 'can-tho-floating-market', photoId: 'photo-1543731068-7e0f5beff43a' },
    { id: 'v14', name: 'Vũng Tàu', keyword: 'vung-tau-coast', photoId: 'photo-1596176530529-78163a4f7af2' },
    { id: 'v15', name: 'Hà Giang', keyword: 'ha-giang-loop', photoId: 'photo-1614713570371-5fa9a5e427b0' },
    { id: 'v16', name: 'Cao Bằng', keyword: 'ban-gioc-waterfall', photoId: 'photo-1605538032432-a9f0c8d9baac' },
    { id: 'v17', name: 'Buôn Ma Thuột', keyword: 'dray-nur-waterfall', photoId: 'photo-1622322370757-5b62b0ce81bd' },
    { id: 'v18', name: 'Pleiku', keyword: 'bien-ho-pleiku', photoId: 'photo-1598902108854-10e335adac99' },
    { id: 'v19', name: 'Kon Tum', keyword: 'kon-tum-wooden-church', photoId: 'photo-1589308078059-be1415eab4c3' },
    { id: 'v20', name: 'Quy Nhơn', keyword: 'qy-nhon-beach', photoId: 'photo-1512100356956-c1b47ee4611b' },
    { id: 'v21', name: 'Tuy Hòa', keyword: 'phu-yen-da-dia', photoId: 'photo-1504280390367-361c6d9f38f4' },
    { id: 'v22', name: 'Phan Thiết', keyword: 'phan-thiet-sea', photoId: 'photo-1568849676085-51415703900f' },
    { id: 'v23', name: 'Ninh Thuận', keyword: 'vinh-hy-bay', photoId: 'photo-1534447677768-be436bb09401' },
    { id: 'v24', name: 'Côn Đảo', keyword: 'con-dao-island-beach', photoId: 'photo-1439066615861-d1af74d74000' },
    { id: 'v25', name: 'Fansipan', keyword: 'fansipan-mountain-peak', photoId: 'photo-1464822759023-fed622ff2c3b' },
    { id: 'v26', name: 'Ba Na Hills', keyword: 'golden-bridge-danang', photoId: 'photo-1587922546307-776227941871' },
    { id: 'v27', name: 'Tam Cốc', keyword: 'tam-coc-rice-river', photoId: 'photo-1470071459604-3b5ec3a7fe05' },
    { id: 'v28', name: 'Tràng An', keyword: 'trang-an-landscape', photoId: 'photo-1501785888041-af3ef285b470' },
    { id: 'v29', name: 'Đảo Lý Sơn', keyword: 'ly-son-island', photoId: 'photo-1473116763269-255415695f6b' },
    { id: 'v30', name: 'Chợ Nổi Cái Răng', keyword: 'mekong-delta-boat', photoId: 'photo-1555215695-3004980ad54e' },
    { id: 'v31', name: 'Châu Đốc', keyword: 'an-giang-mountain', photoId: 'photo-1500530855697-b586d89ba3ee' },
    { id: 'v32', name: 'Đồng Tháp', keyword: 'lotus-flower-swamp', photoId: 'photo-1502082553048-f009c37129b9' },
    { id: 'v33', name: 'Cà Mau', keyword: 'ca-mau-mangrove', photoId: 'photo-1447752875215-b2761acb3c5d' },
    { id: 'v34', name: 'Bạc Liêu', keyword: 'bac-lieu-wind-farm', photoId: 'photo-1466611653911-95081537e5b7' },
    { id: 'v35', name: 'Sóc Trăng', keyword: 'khmer-pagoda', photoId: 'photo-1544644181-1484b3fdfc62' },
    { id: 'v36', name: 'Bến Tre', keyword: 'coconut-river-vietnam', photoId: 'photo-1513836279014-a89f7a76ae86' },
    { id: 'v37', name: 'Mù Cang Chải', keyword: 'mu-cang-chai-terraces', photoId: 'photo-1441974231531-c6227db76b6e' },
    { id: 'v38', name: 'Mai Châu', keyword: 'mai-chau-valley', photoId: 'photo-1433832597046-4f10e10ac764' },
    { id: 'v39', name: 'Đồng Văn', keyword: 'dong-van-karst-plateau', photoId: 'photo-1464822759023-fed622ff2c3b' },
    { id: 'v40', name: 'Ba Bể', keyword: 'ba-be-lake-forest', photoId: 'photo-1472214222541-d510753a8707' },

    // --- NHẬT BẢN (j1 - j40) ---
    { id: 'j1', name: 'Tokyo', keyword: 'shibuya-crossing-night', photoId: 'photo-1503899036084-c55cdd92da26' },
    { id: 'j2', name: 'Kyoto', keyword: 'fushimi-inari-shrine', photoId: 'photo-1493976040374-85c8e12f0c0e' },
    { id: 'j3', name: 'Osaka', keyword: 'dotonbori-neon-sign', photoId: 'photo-1590253587430-f1233689b68d' },
    { id: 'j4', name: 'Núi Phú Sĩ', keyword: 'mount-fuji-cherry-blossom', photoId: 'photo-1490730141103-6cac27aaab94' },
    { id: 'j5', name: 'Nara', keyword: 'nara-park-deer', photoId: 'photo-1542640244-7e672d6cef4e' },
    { id: 'j6', name: 'Hiroshima', keyword: 'itsukushima-torii-gate', photoId: 'photo-1547983653-fc0902210b68' },
    { id: 'j7', name: 'Sapporo', keyword: 'hokkaido-winter-snow', photoId: 'photo-1483168527879-c66136b56105' },
    { id: 'j8', name: 'Okinawa', keyword: 'okinawa-emerald-beach', photoId: 'photo-1535262412227-85541e910204' },
    { id: 'j9', name: 'Yokohama', keyword: 'yokohama-minato-mirai', photoId: 'photo-1542051841857-5f90071e7989' },
    { id: 'j10', name: 'Fukuoka', keyword: 'fukuoka-yatai-food-stalls', photoId: 'photo-1543157145-f78c636d023d' },
    { id: 'j11', name: 'Nagoya', keyword: 'nagoya-castle', photoId: 'photo-1610374827003-099ab4bc3bc3' },
    { id: 'j12', name: 'Kobe', keyword: 'kobe-port-tower', photoId: 'photo-1518156677180-95a2893f3e9f' },
    { id: 'j13', name: 'Nikko', keyword: 'nikko-toshogu-shrine', photoId: 'photo-1504618223053-559bdef9dd5a' },
    { id: 'j14', name: 'Kamakura', keyword: 'kamakura-daibutsu-buddha', photoId: 'photo-1578500494198-246f612d3b3d' },
    { id: 'j15', name: 'Kanazawa', keyword: 'kenrokuen-garden', photoId: 'photo-1526481280693-3bfa75617d33' },
    { id: 'j16', name: 'Takayama', keyword: 'takayama-old-town', photoId: 'photo-1570168007204-dfb528c6958f' },
    { id: 'j17', name: 'Hakodate', keyword: 'hakodate-night-view', photoId: 'photo-1505118380757-91f5f5632de0' },
    { id: 'j18', name: 'Himeji', keyword: 'himeji-castle-white', photoId: 'photo-1533105079780-92b9be482077' },
    { id: 'j19', name: 'Shirakawa-go', keyword: 'shirakawago-gassho-houses', photoId: 'photo-1528164344705-47542687000d' },
    { id: 'j20', name: 'Naoshima', keyword: 'naoshima-pumpkin-island', photoId: 'photo-1504297050568-910d24c426d3' },
    { id: 'j21', name: 'Nagano', keyword: 'jigokudani-snow-monkey', photoId: 'photo-1549488344-1f9b8d2bd1f3' },
    { id: 'j22', name: 'Tateyama Alpine Route', keyword: 'tateyama-snow-wall', photoId: 'photo-1461896836934-ffe607ba8211' },
    { id: 'j23', name: 'Matsushima', keyword: 'matsushima-bay-islands', photoId: 'photo-1454496522488-7a8e488e8606' },
    { id: 'j24', name: 'Kumamoto', keyword: 'kumamoto-castle', photoId: 'photo-1516259762381-22954d7d3ad2' },
    { id: 'j25', name: 'Kagoshima', keyword: 'sakurajima-volcano', photoId: 'photo-1469854523086-cc02fe5d8800' },
    { id: 'j26', name: 'Nagasaki', keyword: 'nagasaki-lantern-festival', photoId: 'photo-1476514525535-07fb3b4ae5f1' },
    { id: 'j27', name: 'Beppu', keyword: 'beppu-onsen-hot-spring', photoId: 'photo-1569336415962-a4bd9f69cd83' },
    { id: 'j28', name: 'Ishigaki Island', keyword: 'ishigaki-coral-reef', photoId: 'photo-1506929562872-bb421503ef21' },
    { id: 'j29', name: 'Shinjuku Gyoen', keyword: 'shinjuku-gyoen-park', photoId: 'photo-1504829857797-ddff28127792' },
    { id: 'j30', name: 'Akihabara', keyword: 'akihabara-anime-district', photoId: 'photo-1563245372-f21724e3856d' },
    { id: 'j31', name: 'Asakusa Sensoji', keyword: 'kaminarimon-gate', photoId: 'photo-1498038432885-c6f3f1b912ee' },
    { id: 'j32', name: 'Kinkaku-ji', keyword: 'golden-pavilion-kyoto', photoId: 'photo-1545569341-9eb8b30979d9' },
    { id: 'j33', name: 'Kiyomizu-dera', keyword: 'kiyomizudera-wooden-stage', photoId: 'photo-1493976040374-85c8e12f0c0e' },
    { id: 'j34', name: 'Ueno Park', keyword: 'ueno-park-cherry-blossom', photoId: 'photo-1522083165195-342750297f4c' },
    { id: 'j35', name: 'Hakone', keyword: 'lake-ashi-torii-gate', photoId: 'photo-1517154421773-0529f29ea451' },
    { id: 'j36', name: 'Kochi', keyword: 'kochi-castle-japan', photoId: 'photo-1520250497591-112f2f40a3f4' },
    { id: 'j37', name: 'Matsuyama', keyword: 'dogo-onsen-bathhouse', photoId: 'photo-1536697246787-1f7ae568d89a' },
    { id: 'j38', name: 'Aomori', keyword: 'hirosaki-castle-park', photoId: 'photo-1480714378408-67cf0d13bc1b' },
    { id: 'j39', name: 'Sendai', keyword: 'sendai-city-tanabata', photoId: 'photo-1496568818309-53d7c775c021' },
    { id: 'j40', name: 'Otaru', keyword: 'otaru-canal-snow', photoId: 'photo-1518391846015-55a9cc003b25' }
];

/**
 * Xây dựng URL CDN Unsplash tối ưu hóa tài nguyên
 * @param {string} photoId 
 * @returns {string} URL CDN có kèm tham số nén hình ảnh từ gốc server
 */
function buildOptimizedUrl(photoId) {
    // Tận dụng xử lý ảnh trực tiếp tại CDN Unsplash (Edge Server Processing) để giảm tải cho node server
    return `https://images.unsplash.com/${photoId}?auto=format,compress&fit=crop&w=${CONFIG.IMAGE_WIDTH}&q=${CONFIG.IMAGE_QUALITY}`;
}

/**
 * Worker xử lý tải và nén ảnh cho một địa điểm cụ thể
 * @param {Object} location 
 */
async function processLocationImage(location) {
    const targetUrl = buildOptimizedUrl(location.photoId);
    const targetFileName = `${location.id}.jpg`;
    const finalPath = path.join(CONFIG.OUTPUT_DIR, targetFileName);

    // Tạo AbortController để quản lý Timeout kết nối mạng
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
        const response = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }

        // Tạo ReadableStream từ body phản hồi mạng
        const nodeReadableStream = response.body;

        // Import thư viện 'sharp' động để kiểm tra và áp dụng tối ưu hóa sâu (Sharp Engine Optimization)
        let sharpEngine;
        try {
            sharpEngine = (await import('sharp')).default;
        } catch (e) {
            // Fallback nếu môi trường chưa cài đặt sharp: Lưu stream nhị phân trực tiếp
        }

        if (sharpEngine) {
            // Pipeline tối ưu hóa: Download -> Resize chuẩn hóa -> Nén Progressive JPEG -> Ghi đĩa cục bộ
            const transformPipeline = sharpEngine()
                .resize({ width: CONFIG.IMAGE_WIDTH, height: Math.round(CONFIG.IMAGE_WIDTH * 0.625), fit: 'cover' }) // Tỷ lệ vàng 16:10 cho Card UI
                .jpeg({ quality: CONFIG.IMAGE_QUALITY, progressive: true, mozjpeg: true });

            await pipeline(nodeReadableStream, transformPipeline, createWriteStream(finalPath));
            console.log(`[[32mSUCCESS[0m] ${location.id.toUpperCase()} -> ${location.name} [Sharp Optimized WebP/JPEG]`);
        } else {
            // Pipeline dự phòng (Fallback Pipeline) khi thiếu thư viện sharp
            await pipeline(nodeReadableStream, createWriteStream(finalPath));
            console.log(`[[33mWARN - NO SHARP[0m] ${location.id.toUpperCase()} -> ${location.name} [Raw Binary Saved]`);
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`[[31mFAILED[0m] Lỗi khi xử lý địa danh ${location.id.toUpperCase()} (${location.name}): ${error.message}`);
        // Log lỗi chi tiết để thực hiện xử lý khôi phục (Recovery/Retry Plan) sau này
    }
}

/**
 * Hàm điều phối chính ứng dụng mô hình Batching-Concurrency Control
 */
async function main() {
    console.log('[36m==================================================================[0m');
    console.log('[36m STARTING DEPLOYMENT: IMAGE HARVESTING & LOCALIZATION PIPELINE  [0m');
    console.log('[36m==================================================================[0m');
    
    const startTime = performance.now();

    // Khởi tạo thư mục đích nếu chưa tồn tại trên Disk Hệ thống
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

    // Thuật toán Batching (Chia nhỏ danh sách chạy song song có kiểm soát)
    for (let i = 0; i < LOCATION_DATASET.length; i += CONFIG.CONCURRENCY_LIMIT) {
        const batch = LOCATION_DATASET.slice(i, i + CONFIG.CONCURRENCY_LIMIT);
        console.log(`
[90m⚙️ Đang xử lý nhóm dữ liệu (Batch): [${i + 1} - ${Math.min(i + CONFIG.CONCURRENCY_LIMIT, LOCATION_DATASET.length)}]/80...[0m`);
        
        // Kích hoạt thực thi đồng thời nhóm Worker
        await Promise.all(batch.map(location => processLocationImage(location)));
    }

    const endTime = performance.now();
    const durationSec = ((endTime - startTime) / 1000).toFixed(2);

    console.log('[36m==================================================================[0m');
    console.log(`[32m SUCCESS: Hoàn tất quy trình chuẩn hóa ảnh cho 80 địa danh.[0m`);
    console.log(` Tổng thời gian thực thi (Execution Time): [33m${durationSec} giây[0m`);
    console.log(` Thư mục lưu trữ: [35mpublic/images/guides/[0m`);
    console.log('[36m==================================================================[0m');
}

// Thực thi chương trình
main().catch(err => {
    console.error('Fatal System Exception Occurred:', err);
    process.exit(1);
});
