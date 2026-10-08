const { exec } = require('child_process');
const path = require('path');

const frontendPath = 'D:\\Trae CN\\METAFLIC · 元影4\\metaflc-platform';
const command = `npm install hls.js`;

exec(command, { cwd: frontendPath }, (error, stdout, stderr) => {
  if (error) {
    console.error(`安装失败: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`警告: ${stderr}`);
    return;
  }
  console.log(`安装成功: ${stdout}`);
});