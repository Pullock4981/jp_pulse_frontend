const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const files = walkSync('e:/Hackathon/hackathon-frontend/hackathon-frontend/src');

let modifiedCount = 0;

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    content = content.replace(/localStorage\.getItem\('token'\)/g, "sessionStorage.getItem('token')");
    content = content.replace(/localStorage\.setItem\('token'/g, "sessionStorage.setItem('token'");
    content = content.replace(/localStorage\.removeItem\('token'\)/g, "sessionStorage.removeItem('token')");
    
    content = content.replace(/localStorage\.getItem\('user'\)/g, "sessionStorage.getItem('user')");
    content = content.replace(/localStorage\.setItem\('user'/g, "sessionStorage.setItem('user'");
    content = content.replace(/localStorage\.removeItem\('user'\)/g, "sessionStorage.removeItem('user')");

    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log('Updated: ' + file);
      modifiedCount++;
    }
  }
});

console.log('Total files updated: ' + modifiedCount);
