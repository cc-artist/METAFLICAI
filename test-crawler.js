const axios = require('axios');

// 模拟爬虫服务的核心功能
async function testCrawler() {
  console.log('开始测试爬虫功能...');
  
  try {
    // 测试从 Archive.org 获取公共领域视频
    console.log('\n1. 测试从 Archive.org 获取视频...');
    const response = await axios.get('https://archive.org/advancedsearch.php', {
      params: {
        q: 'mediatype:movies AND format:"MP4" AND publicdate:[2000-01-01 TO 2023-12-31]',
        fl: 'identifier,title,description,mediatype,format,publicdate,subject',
        rows: 5,
        output: 'json'
      },
      timeout: 30000
    });
    
    const items = response.data.response.docs;
    console.log(`✅ 成功获取 ${items.length} 个视频条目`);
    
    // 测试获取视频文件信息
    if (items.length > 0) {
      console.log('\n2. 测试获取视频文件信息...');
      const firstItem = items[0];
      console.log(`   测试视频: ${firstItem.title || '无标题'}`);
      
      const filesResponse = await axios.get(`https://archive.org/metadata/${firstItem.identifier}`, {
        timeout: 15000
      });
      
      const files = filesResponse.data.files;
      const mp4File = files.find((file) => file.format === 'MP4' && file.name.endsWith('.mp4'));
      
      if (mp4File) {
        console.log(`✅ 成功找到 MP4 文件: ${mp4File.name}`);
        const videoUrl = `https://ia80${Math.floor(Math.random() * 10)}.us.archive.org/${Math.floor(Math.random() * 10)}/${firstItem.identifier}/${mp4File.name}`;
        console.log(`   视频 URL: ${videoUrl}`);
      } else {
        console.log('⚠️  未找到 MP4 文件');
      }
    }
    
    console.log('\n✅ 爬虫功能测试完成！');
    return true;
  } catch (error) {
    console.error('❌ 爬虫测试失败:', error.message);
    return false;
  }
}

// 运行测试
testCrawler();