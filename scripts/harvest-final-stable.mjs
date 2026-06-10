/**
 * @file scripts/harvest-final-stable.mjs
 * @description Master script to fetch and optimize 80 100% authentic landmark images for TravelApp.
 *              Uses hardcoded authentic URLs to avoid API query rate limits.
 * @version 3.0.0
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

const IMAGES_DATASET = [
  // --- VIỆT NAM (v1 - v40) ---
  { id: 'v1', name: 'Hà Nội', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Hoan_Kiem.jpg' },
  { id: 'v2', name: 'Vịnh Hạ Long', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/V%E1%BB%8Bnh_H%E1%BA%A1_Long_-_NKS.jpg/1280px-V%E1%BB%8Bnh_H%E1%BA%A1_Long_-_NKS.jpg' },
  { id: 'v3', name: 'Sapa', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Thacbac3.jpg/1280px-Thacbac3.jpg' },
  { id: 'v4', name: 'Ninh Bình', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Muaxuantamcoc.jpg' },
  { id: 'v5', name: 'Huế', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Du_kh%C3%A1ch_vi%E1%BA%BFng_th%C4%83m_L%E1%BA%A7u_Ng%C5%A9_Ph%E1%BB%A5ng.JPG' },
  { id: 'v6', name: 'Đà Nẵng', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Dragon_bridge_from_above.png/1280px-Dragon_bridge_from_above.png' },
  { id: 'v7', name: 'Hội An', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/PhoCoHoiAn.jpg' },
  { id: 'v8', name: 'Nha Trang', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Nha_Trang%2C_Kh%C3%A1nh_H%C3%B2a.png/1280px-Nha_Trang%2C_Kh%C3%A1nh_H%C3%B2a.png' },
  { id: 'v9', name: 'Đà Lạt', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Da_Lat_-_Viet_Nam.jpg/1280px-Da_Lat_-_Viet_Nam.jpg' },
  { id: 'v10', name: 'TP. Hồ Chí Minh', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Notre_dame_saigon.jpg/1280px-Notre_dame_saigon.jpg' },
  { id: 'v11', name: 'Phú Quốc', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Phu_Quoc%2C_Viet_Nam.jpg/1280px-Phu_Quoc%2C_Viet_Nam.jpg' },
  { id: 'v12', name: 'Cần Thơ', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/M%E1%BB%99t_c%E1%BA%A3nh_%E1%BB%9F_ch%E1%BB%A3_n%E1%BB%95i_C%C3%A1i_R%C4%83ng.jpg/1280px-M%E1%BB%99t_c%E1%BA%A3nh_%E1%BB%9F_ch%E1%BB%A3_n%E1%BB%95i_C%C3%A1i_R%C4%83ng.jpg' },
  { id: 'v13', name: 'Mũi Né', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/M%C5%A9i_N%C3%A9_Fishing_Village.jpg/1280px-M%C5%A9i_N%C3%A9_Fishing_Village.jpg' },
  { id: 'v14', name: 'Phong Nha', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Phongnhakebang6.jpg/1280px-Phongnhakebang6.jpg' },
  { id: 'v15', name: 'Hà Giang', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/C%E1%BB%99t_c%E1%BB%9D_L%C5%A9ng_C%C3%BA.JPG/1280px-C%E1%BB%99t_c%E1%BB%9D_L%C5%A9ng_C%C3%BA.JPG' },
  { id: 'v16', name: 'Côn Đảo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/C%C3%B4n_%C4%90%E1%BA%A3o%2C_B%C3%A0_R%E1%BB%8Ba_-_V%C5%A9ng_T%C3%A0u%2C_Vietnam_-_panoramio_%2833%29.jpg/1280px-C%C3%B4n_%C4%90%E1%BA%A3o%2C_B%C3%A0_R%E1%BB%8Ba_-_V%C5%A9ng_T%C3%A0u%2C_Vietnam_-_panoramio_%2833%29.jpg' },
  { id: 'v17', name: 'Buôn Ma Thuột', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Draynur_falls.jpg/1280px-Draynur_falls.jpg' },
  { id: 'v18', name: 'Mỹ Sơn', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/2024_-_M%E1%BB%B9_S%C6%A1n_Group_B%2C_C_and_D_-_img_23.jpg/1280px-2024_-_M%E1%BB%B9_S%C6%A1n_Group_B%2C_C_and_D_-_img_23.jpg' },
  { id: 'v19', name: 'Tây Ninh', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dau_Tieng_Lake_-_50766650163.png/1280px-Dau_Tieng_Lake_-_50766650163.png' },
  { id: 'v20', name: 'Vũng Tàu', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/White_Palace_Vung_Tau_from_Flycam.jpg' },
  { id: 'v21', name: 'Hồ Ba Bể', url: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Ba_Be_Lake_2.jpg' },
  { id: 'v22', name: 'Lạng Sơn', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Ch%C3%B9a_Tam_Thanh.jpg/1280px-Ch%C3%B9a_Tam_Thanh.jpg' },
  { id: 'v23', name: 'Thác Bản Giốc', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Bangioc9tam.jpg/1280px-Bangioc9tam.jpg' },
  { id: 'v24', name: 'Mù Cang Chải', url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/KHAU_PH%E1%BA%A0_M%C3%99A_N%C6%AF%E1%BB%9AC_%C4%90%E1%BB%94_-_panoramio.jpg' },
  { id: 'v25', name: 'Điện Biên Phủ', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Victory_in_Battle_of_Dien_Bien_Phu.jpg/1280px-Victory_in_Battle_of_Dien_Bien_Phu.jpg' },
  { id: 'v26', name: 'Mộc Châu', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/S%E1%BB%91ng_l%C6%B0ng_kh%E1%BB%A7ng_long_T%C3%A0_X%C3%B9a.jpg/1280px-S%E1%BB%91ng_l%C6%B0ng_kh%E1%BB%A7ng_long_T%C3%A0_X%C3%B9a.jpg' },
  { id: 'v27', name: 'Cát Bà', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Lan_Ha_Bay.JPG' },
  { id: 'v28', name: 'Tam Cốc', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Muaxuantamcoc.jpg' },
  { id: 'v29', name: 'Chùa Tam Chúc', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/H%E1%BB%93_Tam_Ch%C3%BAc.jpg' },
  { id: 'v30', name: 'Chùa Bái Đính', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Chua_Bai_Dinh_X8.JPG/1280px-Chua_Bai_Dinh_X8.JPG' },
  { id: 'v31', name: 'Đỉnh Fansipan', url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/C%C3%A1p-treo-fansipan-17.jpg' },
  { id: 'v32', name: 'Ba Na Hills', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Golden_Bridge_at_Ba_Na_Hills_20250718.jpg/1280px-Golden_Bridge_at_Ba_Na_Hills_20250718.jpg' },
  { id: 'v33', name: 'Kỳ Co', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Ky_Co_-_Nhon_Ly_-_Quy_Nhon_-_Binh_Dinh_-_Viet_Nam.jpg/1280px-Ky_Co_-_Nhon_Ly_-_Quy_Nhon_-_Binh_Dinh_-_Viet_Nam.jpg' },
  { id: 'v34', name: 'Eo Gió', url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Eo_Gi%C3%B3_-_Nh%C6%A1n_L%C3%BD.jpg' },
  { id: 'v35', name: 'Lý Sơn', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/C%E1%BB%95ng_ch%C3%A0o_tr%C3%AAn_Huy%E1%BB%87n_%C4%90%E1%BA%A3o_L%C3%BD_S%C6%A1n_-_Qu%E1%BA%A3ng_Ng%C3%A3i.jpg/1280px-C%E1%BB%95ng_ch%C3%A0o_tr%C3%AAn_Huy%E1%BB%87n_%C4%90%E1%BA%A3o_L%C3%BD_S%C6%A1n_-_Qu%E1%BA%A3ng_Ng%C3%A3i.jpg' },
  { id: 'v36', name: 'Ghềnh Đá Đĩa', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/G%C3%A0nh_%C4%90%C3%A1_%C4%90%C4%A9a_-_Ph%C3%BA_Y%C3%AAn.jpg/1280px-G%C3%A0nh_%C4%90%C3%A1_%C4%90%C4%A9a_-_Ph%C3%BA_Y%C3%AAn.jpg' },
  { id: 'v37', name: 'Bàu Trắng', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/B%C3%A0u_Tr%E1%BA%AFng_%2828680306740%29.jpg/1280px-B%C3%A0u_Tr%E1%BA%AFng_%2828680306740%29.jpg' },
  { id: 'v38', name: 'Châu Đốc', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Mieuba2.jpg/1280px-Mieuba2.jpg' },
  { id: 'v39', name: 'Đất Mũi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Tuongdaimuicamau.jpg/1280px-Tuongdaimuicamau.jpg' },
  { id: 'v40', name: 'Hà Tiên', url: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Thachdong.jpg' },

  // --- NHẬT BẢN (j1 - j40) ---
  { id: 'j1', name: 'Tokyo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Shibuya_Crossing%2C_Aerial.jpg/1280px-Shibuya_Crossing%2C_Aerial.jpg' },
  { id: 'j2', name: 'Kyoto', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg/1280px-Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg' },
  { id: 'j3', name: 'Osaka', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Osaka_Castle_03bs3200.jpg/1280px-Osaka_Castle_03bs3200.jpg' },
  { id: 'j4', name: 'Hokkaido', url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/SapporoCity_Skylines2020.jpg' },
  { id: 'j5', name: 'Núi Phú Sĩ', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/1280px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg' },
  { id: 'j6', name: 'Itsukushima', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg/1280px-Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg' },
  { id: 'j7', name: 'Nara', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Nara_Park_-_panoramio_%282%29.jpg/1280px-Nara_Park_-_panoramio_%282%29.jpg' },
  { id: 'j8', name: 'Shirakawa-go', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Ogi_Shirakawa-g%C5%8D%2C_Gifu%2C_Japan.jpg/1280px-Ogi_Shirakawa-g%C5%8D%2C_Gifu%2C_Japan.jpg' },
  { id: 'j9', name: 'Hakone', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Hakonejinja_-01.jpg/1280px-Hakonejinja_-01.jpg' },
  { id: 'j10', name: 'Arashiyama', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Bamboo_Grove%2C_Arashiyama%2C_Kyoto%2C_Japan.jpg/1280px-Bamboo_Grove%2C_Arashiyama%2C_Kyoto%2C_Japan.jpg' },
  { id: 'j11', name: 'Nikko', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg/1280px-200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg' },
  { id: 'j12', name: 'Kamakura', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/230128_Kamakura_Daibutsu_Japan04s3.jpg/1280px-230128_Kamakura_Daibutsu_Japan04s3.jpg' },
  { id: 'j13', name: 'Fukuoka', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Yomise%28Yatai%29.JPG/1280px-Yomise%28Yatai%29.JPG' },
  { id: 'j14', name: 'Kanazawa', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Stone_lantern_Kenrokuen.jpg/1280px-Stone_lantern_Kenrokuen.jpg' },
  { id: 'j15', name: 'Okinawa', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Furuzamami_beach_Okinawa_Zamami.jpg/1280px-Furuzamami_beach_Okinawa_Zamami.jpg' },
  { id: 'j16', name: 'Yokohama', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Minato_Mirai_In_Blue.jpg/1280px-Minato_Mirai_In_Blue.jpg' },
  { id: 'j17', name: 'Nagoya', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Nagoya_Castle_7.jpg/1280px-Nagoya_Castle_7.jpg' },
  { id: 'j18', name: 'Sendai', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Waki-yagura_of_Sendai_Castle_20220910b.jpg/1280px-Waki-yagura_of_Sendai_Castle_20220910b.jpg' },
  { id: 'j19', name: 'Sapporo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Hokkaido_Sapporo_Odori_Park.jpg/1280px-Hokkaido_Sapporo_Odori_Park.jpg' },
  { id: 'j20', name: 'Kobe', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/20190901_Kobe_Port_Tower-1.jpg/1280px-20190901_Kobe_Port_Tower-1.jpg' },
  { id: 'j21', name: 'Hiroshima', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Genbaku_Dome04-r.JPG/1280px-Genbaku_Dome04-r.JPG' },
  { id: 'j22', name: 'Nagasaki', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Glover_House.jpg/1280px-Glover_House.jpg' },
  { id: 'j23', name: 'Kumamoto', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Kumamoto_Castle_Keep_Tower_20221022-3.jpg/1280px-Kumamoto_Castle_Keep_Tower_20221022-3.jpg' },
  { id: 'j24', name: 'Okayama', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/250505_Korakuen_Okayama_Japan06s3.jpg/1280px-250505_Korakuen_Okayama_Japan06s3.jpg' },
  { id: 'j25', name: 'Takayama', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Takayama%27s_Early_Winter_Welcome_%28NE%29.jpg/1280px-Takayama%27s_Early_Winter_Welcome_%28NE%29.jpg' },
  { id: 'j26', name: 'Matsumoto', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Matsumoto_Castle_Keep_Tower.jpg/1280px-Matsumoto_Castle_Keep_Tower.jpg' },
  { id: 'j27', name: 'Ise', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Naiku_04.jpg/1280px-Naiku_04.jpg' },
  { id: 'j28', name: 'Beppu', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Beppu_Tower02s4s3200.jpg/1280px-Beppu_Tower02s4s3200.jpg' },
  { id: 'j29', name: 'Kagoshima', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Sakurajima55.jpg/1280px-Sakurajima55.jpg' },
  { id: 'j30', name: 'Aomori', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Nebuta_Museum_Wa_Rasse_exterior.jpg/1280px-Nebuta_Museum_Wa_Rasse_exterior.jpg' },
  { id: 'j31', name: 'Gifu', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Gifu_Castle.jpg/1280px-Gifu_Castle.jpg' },
  { id: 'j32', name: 'Nagano', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/160501_Zenkoji_Nagano_Japan06s3.jpg/1280px-160501_Zenkoji_Nagano_Japan06s3.jpg' },
  { id: 'j33', name: 'Shizuoka', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Fuji_from_Nihondaira.JPG/1280px-Fuji_from_Nihondaira.JPG' },
  { id: 'j34', name: 'Toyama', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Toyama_Municipal_Folk_Museum_%28mock_keep_tower_of_the_Toyama_Castle%29_20180503.jpg/1280px-Toyama_Municipal_Folk_Museum_%28mock_keep_tower_of_the_Toyama_Castle%29_20180503.jpg' },
  { id: 'j35', name: 'Morioka', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/171103_Morioka_Castle_Morioka_Iwate_pref_Japan20s3.jpg/1280px-171103_Morioka_Castle_Morioka_Iwate_pref_Japan20s3.jpg' },
  { id: 'j36', name: 'Akita', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Osumi-Yagura_of_Kubota-Castle_20160424.jpg/1280px-Osumi-Yagura_of_Kubota-Castle_20160424.jpg' },
  { id: 'j37', name: 'Yamagata', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Risshaku-ji_Kaisan-do_201706b.jpg/1280px-Risshaku-ji_Kaisan-do_201706b.jpg' },
  { id: 'j38', name: 'Niigata', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Niigata_from_Bandaijima_Building_20200906_P4.jpg/1280px-Niigata_from_Bandaijima_Building_20200906_P4.jpg' },
  { id: 'j39', name: 'Matsuyama', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Dogo_onsen_honkan_long_exposure.jpg/1280px-Dogo_onsen_honkan_long_exposure.jpg' },
  { id: 'j40', name: 'Kochi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Kochi_Castle_2025.jpg/1280px-Kochi_Castle_2025.jpg' }
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
      const backoff = attempt * 3000;
      console.log(`[ RETRYING ] ${id.toUpperCase()} -> Waiting ${backoff / 1000}s...`);
      await sleep(backoff);
      return await processImage(id, name, url, attempt + 1);
    }
    return false;
  }
}

async function main() {
  console.log("==================================================================");
  console.log(" STARTING STABLE SEQUENTIAL AUTHENTIC HARVEST: 80 DESTINATIONS");
  console.log("==================================================================");

  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

  const auditLog = [];

  for (let i = 0; i < IMAGES_DATASET.length; i++) {
    const item = IMAGES_DATASET[i];
    console.log(`[${i + 1}/80] Processing: ${item.id.toUpperCase()} (${item.name})...`);
    
    const success = await processImage(item.id, item.name, item.url);
    auditLog.push({ id: item.id, name: item.name, status: success ? 'SUCCESS' : 'DOWNLOAD_FAILED', url: item.url });

    // Add a delay between each landmark processing to be friendly to Wikimedia
    await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);
  }

  // Write audit report
  let report = `# STABLE AUTHENTIC LANDMARK IMAGES HARVEST REPORT\n\n`;
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
