const { crawlRealVideos } = require('./metaflc-backend/dist/services/crawlerService');

async function testCrawler() {
  console.log('🚀 测试高效爬虫方案...');
  
  try {
    const videos = await crawlRealVideos();
    console.log(`🎉 爬虫成功获取到 ${videos.length} 个视频资源！`);
    
    // 输出前5个视频的信息，验证数据结构
    console.log('\n📋 前5个视频资源信息：');
    videos.slice(0, 5).forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title}`);
      console.log(`   分类: ${video.category}`);
      console.log(`   评分: ${video.rating}`);
      console.log(`   年份: ${video.releaseYear}`);
      console.log(`   时长: ${video.duration}秒`);
      console.log(`   播放链接: ${video.url}`);
      console.log(`   来源: ${video.source}`);
    });
    
    // 统计各分类数量
    console.log('\n📊 各分类视频数量统计：');
    const categoryCounts = videos.reduce((acc, video) => {
      acc[video.category] = (acc[video.category] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`${category}: ${count}个`);
    });
    
    console.log('\n✅ 高效爬虫方案测试成功！');
    return true;
  } catch (error) {
    console.error('❌ 爬虫测试失败:', error.message);
    return false;
  }
}

testCrawler();
