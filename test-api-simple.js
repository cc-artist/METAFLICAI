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
        const response = JSON.parse(data);
        console.log('✅ API请求成功');
        console.log('📊 视频总数:', response.data.totalVideos);
        console.log('📋 视频数组长度:', response.data.videos.length);
        
        if (response.data.videos.length > 0) {
          console.log('\n📺 视频资源列表:');
          response.data.videos.forEach((video, index) => {
            console.log(`${index + 1}. 标题: ${video.title}`);
            console.log(`   分类: ${video.category}`);
            console.log(`   来源: ${video.source || '未知'}`);
            console.log(`   URL: ${video.url}`);
            console.log('---');
          });
        } else {
          console.log('\n⚠️  目前没有视频资源，爬虫可能正在从真实网站爬取资源...');
          console.log('   请稍后再测试，或者检查后端服务日志查看爬虫状态。');
        }
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
