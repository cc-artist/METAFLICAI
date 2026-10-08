// 测试前端API调用
const fetch = require('node-fetch');

async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/videos');
        const data = await response.json();
        
        console.log('API响应状态:', response.status);
        console.log('API返回数据格式:', typeof data);
        console.log('API返回数据结构:', Object.keys(data));
        console.log('视频数量:', data.data.videos.length);
        
        if (data.data.videos.length > 0) {
            console.log('第一个视频数据:', JSON.stringify(data.data.videos[0], null, 2));
            console.log('视频URL:', data.data.videos[0].url);
            console.log('视频缩略图:', data.data.videos[0].thumbnail);
            console.log('视频标题:', data.data.videos[0].title);
            console.log('视频描述:', data.data.videos[0].description);
        }
    } catch (error) {
        console.error('API测试失败:', error);
    }
}

testApi();