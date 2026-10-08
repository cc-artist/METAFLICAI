# 简单的后端启动脚本
# 使用 PowerShell 直接运行 ts-node

Write-Host "启动 METAFLIC 后端服务..."
Write-Host "当前目录: $PWD"

# 检查是否在正确的目录
if (-not (Test-Path "./metaflc-backend")) {
    Write-Host "错误: 请在项目根目录运行此脚本"
    exit 1
}

# 切换到后端目录
Set-Location -Path "./metaflc-backend"
Write-Host "切换到后端目录: $PWD"

# 检查 ts-node 是否安装
if (-not (Get-Command "npx" -ErrorAction SilentlyContinue)) {
    Write-Host "错误: npx 未安装，请先安装 Node.js 和 npm"
    exit 1
}

# 运行后端服务
Write-Host "正在启动后端服务..."
Write-Host "使用 ts-node 运行 src/index.ts"
npx ts-node src/index.ts