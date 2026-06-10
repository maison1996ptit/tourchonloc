import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public/images/guides');

async function main() {
  console.log("--- PHYSICAL ASSET INTEGRITY REPORT ---");
  if (!fs.existsSync(dir)) {
    console.error("Directory not found!");
    return;
  }

  const files = fs.readdirSync(dir);
  console.log(`Total files in directory: ${files.length}`);

  const sampleFiles = ['v1.jpg', 'j1.jpg', 'j5.jpg'];
  sampleFiles.forEach(f => {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      console.log(`- ${f}: Size=${stat.size} bytes, LastModified=${stat.mtime}`);
    } else {
      console.log(`- ${f}: MISSING!`);
    }
  });
  console.log("---------------------------------------");
}
main();
