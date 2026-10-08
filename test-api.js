const http = require('http');

// 测试获取所有视频资源
http.get('http://localhost:3000/api/v1/videos', (res) => {
  let data = '';

  // 接收响应数据
  res.on('data', (chunk) => {
    data += chunk;
  });

  // 响应结束时处理数据
  res.on('end', () => {
    console.log('📡 API响应状态码:', res.statusCode);
    if (res.statusCode === 200) {
      try {
        const videos = JSON.parse(data);
        console.log('📊 成功获取到', videos.length, '个视频资源');
        
        // 按分类统计视频数量
        const categories = {};
        videos.forEach(video => {
          const category = video.category;
          categories[category] = (categories[category] || 0) + 1;
        });
        
        console.log('📋 视频分类统计:');
        Object.entries(categories).forEach(([category, count]) => {
          console.log(`   ${category}: ${count} 个`);
        });
        
        // 显示前3个视频的详情
        console.log('\n📺 前3个视频详情:');
        videos.slice(0, 3).forEach((video, index) => {
          console.log(`${index + 1}. 标题: ${video.title}`);
          console.log(`   分类: ${video.category}`);
          console.log(`   来源: ${video.source || '未知'}`);
          console.log(`   URL: ${video.url}`);
          console.log('---');
        });
      } catch (error) {
        console.error('❌ 解析响应数据失败:', error.message);
        console.log('原始响应数据:', data);
      }
    } else {
      console.error('❌ API请求失败，状态码:', res.statusCode);
      console.log('响应内容:', data);
    }
  });
}).on('error', (error) => {
  console.error('❌ API请求出错:', error.message);
});
