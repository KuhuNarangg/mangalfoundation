const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function removeMotionProps(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove motion props
  content = content.replace(/\s*initial={{.*?}}/gs, '');
  content = content.replace(/\s*whileInView={{.*?}}/gs, '');
  content = content.replace(/\s*viewport={{.*?}}/gs, '');
  content = content.replace(/\s*transition={{.*?}}/gs, '');
  
  // Replace <motion.tag with <tag
  content = content.replace(/<motion\.([a-zA-Z0-9]+)/g, '<$1');
  content = content.replace(/<\/motion\.([a-zA-Z0-9]+)>/g, '</$1>');
  
  // Also remove group-hover:scale-105 from mobile
  content = content.replace(/group-hover:scale-105/g, 'md:group-hover:scale-105');

  fs.writeFileSync(filePath, content, 'utf8');
}

walkDir(path.join(__dirname, 'src/components/sections'), removeMotionProps);
walkDir(path.join(__dirname, 'src/components/donate'), removeMotionProps);

console.log("Removed all scroll effects and mobile hover zooms.");
