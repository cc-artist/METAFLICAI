const axios = require('axios');
const cheerio = require('cheerio');

async function testBytTorpsifCrawl() {
  try {
    console.log('开始测试byttorpsif.com爬取...');
    
    // 发送HTTP请求获取网站内容
    // 先爬取首页获取分类信息
    const response = await axios.get('https://byttorpsif.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    console.log('成功获取网站内容，状态码:', response.status);
    
    // 使用Cheerio解析HTML
    const $ = cheerio.load(response.data);
    
    // 分析网站结构
    console.log('\n=== 网站结构分析 ===');
    
    // 获取分类信息
    const categories = [];
    $('.fed-navs-info a').each((index, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      if (href && text && href !== '/') {
        categories.push({ name: text, url: href });
      }
    });
    
    console.log('发现的分类:');
    categories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.url}`);
    });
    
    // 测试爬取一个具体分类页面，比如重生分类
    if (categories.length > 0) {
      const testCategory = categories[0];
      console.log(`\n=== 测试爬取分类: ${testCategory.name} ===`);
      
      const catResponse = await axios.get(`https://byttorpsif.com${testCategory.url}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      console.log(`成功获取分类页面内容，状态码: ${catResponse.status}`);
      
      const $cat = cheerio.load(catResponse.data);
      
      // 查找视频列表项
      const videoItems = [];
      
      // 尝试不同的选择器查找视频项
      const selectors = [
        '.fed-list-item',
        '.fed-part-rows',
        '.fed-col-xs-6',
        '.fed-col-md-2',
        '.fed-col-md-3',
        'div[class*="item"]',
        'div[class*="video"]'
      ];
      
      for (const selector of selectors) {
        const items = $cat(selector);
        if (items.length > 0) {
          console.log(`使用选择器 ${selector} 找到 ${items.length} 个视频项`);
          
          items.each((index, element) => {
            const $item = $cat(element);
            const title = $item.find('a').text().trim();
            const href = $item.find('a').attr('href');
            const img = $item.find('img').attr('src');
            
            if (title && href) {
              videoItems.push({
                title: title,
                url: href,
                thumbnail: img ? `https://byttorpsif.com${img}` : '',
                category: testCategory.name
              });
            }
          });
          
          break;
        }
      }
      
      console.log(`\n提取到 ${videoItems.length} 个视频项`);
      if (videoItems.length > 0) {
        console.log('前10个视频项:');
        videoItems.slice(0, 10).forEach((item, index) => {
          console.log(`${index + 1}. ${item.title}`);
          console.log(`   URL: ${item.url}`);
          console.log(`   缩略图: ${item.thumbnail}`);
          console.log(`   分类: ${item.category}`);
        });
        
        // 测试爬取一个具体的视频页面
        const testVideo = videoItems[0];
        console.log(`\n=== 测试爬取视频详情: ${testVideo.title} ===`);
        
        const videoResponse = await axios.get(`https://byttorpsif.com${testVideo.url}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        });
        
        console.log(`成功获取视频页面内容，状态码: ${videoResponse.status}`);
        
        const $video = cheerio.load(videoResponse.data);
        
        // 查找视频播放链接
        console.log('\n=== 查找视频播放链接 ===');
        
        // 查找iframe标签
        const iframes = $video('iframe');
        console.log(`找到 ${iframes.length} 个iframe标签`);
        iframes.each((index, element) => {
          const src = $video(element).attr('src');
          const width = $video(element).attr('width');
          const height = $video(element).attr('height');
          console.log(`iframe ${index + 1}: ${src} (${width}x${height})`);
        });
        
        // 查找video标签
        const videos = $video('video');
        console.log(`\n找到 ${videos.length} 个video标签`);
        videos.each((index, element) => {
          const src = $video(element).attr('src');
          const poster = $video(element).attr('poster');
          console.log(`video ${index + 1}: ${src}`);
          console.log(`   海报: ${poster}`);
          
          // 查找source标签
          const sources = $video(element).find('source');
          sources.each((srcIndex, srcElement) => {
            const srcUrl = $video(srcElement).attr('src');
            const type = $video(srcElement).attr('type');
            console.log(`   source ${srcIndex + 1}: ${srcUrl} (${type})`);
          });
        });
        
        // 查找脚本中的视频链接
        console.log('\n=== 查找脚本中的视频链接 ===');
        const scripts = $video('script').text();
        
        // 尝试匹配视频链接模式
        const videoUrlPatterns = [
          /https?:\/\/[^"\']+\.(mp4|m3u8|avi|flv|wmv|mov)[^"\']*/gi,
          /src\s*=\s*["\']([^"\']+\.(mp4|m3u8|avi|flv|wmv|mov)[^"\']*)["\']/gi,
          /videoUrl\s*=\s*["\']([^"\']+)["\']/gi,
          /playUrl\s*=\s*["\']([^"\']+)["\']/gi
        ];
        
        let foundVideoUrls = [];
        for (const pattern of videoUrlPatterns) {
          const matches = scripts.match(pattern);
          if (matches) {
            foundVideoUrls = foundVideoUrls.concat(matches);
          }
        }
        
        if (foundVideoUrls.length > 0) {
          console.log('找到视频链接:');
          foundVideoUrls.slice(0, 5).forEach((url, index) => {
            console.log(`${index + 1}. ${url}`);
          });
        } else {
          console.log('未找到明确的视频链接');
        }
        
        // 提取视频详细信息
        console.log('\n=== 提取视频详细信息 ===');
        
        // 查找标题
        const videoTitle = $video('title').text().trim();
        console.log('视频标题:', videoTitle);
        
        // 查找描述
        const description = $video('meta[name="description"]').attr('content') || '';
        console.log('视频描述:', description);
        
        // 查找其他元信息
        const metaInfo = $video('div[class*="info"]').text().trim();
        if (metaInfo) {
          console.log('元信息:', metaInfo);
        }
      }
    }
    
    return { success: true, message: '爬取测试完成' };
    
  } catch (error) {
    console.error('爬取测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data.substring(0, 200) + '...');
    }
    return { success: false, message: error.message };
  }
}

testBytTorpsifCrawl();