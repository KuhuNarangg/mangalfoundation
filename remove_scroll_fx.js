const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function removeScrollProps(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Only remove initial, whileInView, and viewport from motion tags that trigger on scroll
  // We keep `animate` so active hero animations stay intact and types don't break
  content = content.replace(/\s*initial={{.*?}}/g, '');
  content = content.replace(/\s*whileInView={{.*?}}/g, '');
  content = content.replace(/\s*viewport={{.*?}}/g, '');
  
  // Remove hover scaling and color changes that might misfire on mobile scroll
  content = content.replace(/md:group-hover:scale-105/g, '');
  content = content.replace(/md:group-hover:grayscale-0/g, '');
  content = content.replace(/group-hover:-translate-y-2/g, '');
  content = content.replace(/transition-transform duration-[0-9]+/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
}

walkDir(path.join(__dirname, 'src/components/sections'), removeScrollProps);
walkDir(path.join(__dirname, 'src/components/donate'), removeScrollProps);

console.log("Removed framer motion scroll props and hover zooms.");
