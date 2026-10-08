const { spawn } = require('child_process');

// 直接调用 ts-node 执行 index.ts
const child = spawn('npx', ['ts-node', 'src/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`ts-node 进程退出，代码: ${code}`);
});