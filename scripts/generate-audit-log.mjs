import fs from 'fs';
import path from 'path';

const harvestFile = fs.readFileSync(path.join(process.cwd(), 'scripts/final-harvest-80.mjs'), 'utf8');
const guideMapsFile = fs.readFileSync(path.join(process.cwd(), 'src/data/guideMaps.ts'), 'utf8');

// Extract the landmarks array from harvest script
const landmarksMatch = harvestFile.match(/const landmarks = \[([\s\S]*?)\];/);
const urlMap = {};
if (landmarksMatch) {
  const lines = landmarksMatch[1].split('\n');
  for (const line of lines) {
    const match = line.match(/id:\s*'([^']+)',\s*url:\s*'([^']+)'/);
    if (match) {
      urlMap[match[1]] = match[2];
    }
  }
}

// Extract names from guideMaps
const nameMap = {};
const nameMatches = guideMapsFile.matchAll(/id:\s*'([^']+)',\s*name:\s*'([^']+)'/g);
for (const match of nameMatches) {
  nameMap[match[1]] = match[2];
}

let markdown = `# BÁO CÁO KIỂM TOÁN LỖI HÌNH ẢNH (IMAGE AUDIT LOG)\n\n`;
markdown += `**Mức độ:** Nghiêm trọng (Dữ liệu rác/Không chính xác)\n`;
markdown += `**Nguyên nhân gốc rễ (Root Cause):**\n`;
markdown += `1. Nguồn Unsplash/Pexels chuyên về ảnh nghệ thuật (Aesthetic), rất thiếu ảnh các địa danh cụ thể (ví dụ: Ghềnh Đá Đĩa, Tam Chúc).\n`;
markdown += `2. Thay vì dùng API tìm kiếm chính xác, tôi đã phụ thuộc vào kết quả Google Search text, dẫn đến việc lấy các ID ảnh không hề liên quan đến địa danh thật.\n`;
markdown += `3. Cơ chế "Fallback" (sao chép ảnh qua lại khi lỗi 404) tiếp tục phá nát tính chính xác của hình ảnh.\n\n`;
markdown += `Dưới đây là Bảng đối chiếu toàn bộ 80 địa danh và Link gốc mà tôi đã "ngu ngốc" tải về để bạn có thể tự kiểm chứng sự sai lệch:\n\n`;

markdown += `## 1. VIỆT NAM (40 Địa điểm)\n`;
markdown += `| ID | Tên Địa Danh trên Web | URL Ảnh Gốc Tôi Đã Tải Về (Sai lệch) |\n`;
markdown += `|---|---|---|\n`;

for (let i = 1; i <= 40; i++) {
  const id = `v${i}`;
  const name = nameMap[id] || 'Unknown';
  const url = urlMap[id] || 'N/A';
  markdown += `| ${id} | **${name}** | [Link Ảnh](${url}) |\n`;
}

markdown += `\n## 2. NHẬT BẢN (40 Địa điểm)\n`;
markdown += `| ID | Tên Địa Danh trên Web | URL Ảnh Gốc Tôi Đã Tải Về (Sai lệch) |\n`;
markdown += `|---|---|---|\n`;

for (let i = 1; i <= 40; i++) {
  const id = `j${i}`;
  const name = nameMap[id] || 'Unknown';
  const url = urlMap[id] || 'N/A';
  markdown += `| ${id} | **${name}** | [Link Ảnh](${url}) |\n`;
}

markdown += `\n---\n**Đề xuất khắc phục dứt điểm:** Không dùng Pexels/Unsplash nữa. Chuyển sang sử dụng **Wikimedia Commons API** (Bách khoa toàn thư mở) - đây là nguồn dữ liệu DUY NHẤT có ảnh chính xác của các địa danh ngách như Mù Cang Chải, Eo Gió, v.v.\n`;

fs.writeFileSync(path.join(process.cwd(), 'IMAGE_AUDIT_LOG.md'), markdown);
console.log("Audit log generated at IMAGE_AUDIT_LOG.md");
