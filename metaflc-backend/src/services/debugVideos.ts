import { getAllVideos } from './crawlerService';

// 检查所有视频资源的有效性
setInterval(async () => {
  const videos = await getAllVideos();
  console.log(`\n🔍 调试 - 数据库中视频总数: ${videos.length}`);
  
  // 统计各分类视频数量
  const categories = ['短剧', '漫剧', '综艺', '赛事&演出', '超级IP', '高概念', '合家欢'];
  categories.forEach(category => {
    const categoryVideos = videos.filter((video: any) => video.category === category);
    console.log(`   ${category}: ${categoryVideos.length} 个`);
    
    // 检查前3个视频的URL是否有效
    const sampleVideos = categoryVideos.slice(0, 3);
    sampleVideos.forEach((video: any, index: number) => {
      console.log(`     ${index + 1}. ${video.title} - URL: ${video.url}`);
    });
  });
}, 5000); // 每5秒输出一次

console.log('🚀 视频调试服务已启动，每5秒输出一次视频资源状态');
