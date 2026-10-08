const axios = require('axios');
const cheerio = require('cheerio');

async function checkNovelQuickApp() {
  try {
    const url = 'https://novelquickapp.com/';
    console.log(`正在请求: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    });
    
    console.log(`响应状态码: ${response.status}`);
    
    // 保存完整HTML到文件，方便查看
    const fs = require('fs');
    fs.writeFileSync('novelquickapp.html', response.data);
    console.log('HTML内容已保存到novelquickapp.html文件');
    
    const $ = cheerio.load(response.data);
    
    // 查看网站的基本结构
    console.log('\n网站基本结构:');
    console.log('标题:', $('title').text());
    console.log('Meta描述:', $('meta[name="description"]').attr('content'));
    
    // 查找所有script标签，看看是否有其他动态数据
    console.log('\n查找script标签...');
    const scripts = $('script');
    console.log(`找到 ${scripts.length} 个script标签`);
    
    // 查看前5个script标签的内容
    for (let i = 0; i < Math.min(5, scripts.length); i++) {
      const scriptContent = $(scripts[i]).html();
      if (scriptContent) {
        console.log(`\nScript ${i+1} 长度: ${scriptContent.length}`);
        // 检查是否包含novelquickapp相关的内容
        if (scriptContent.includes('novel') || scriptContent.includes('quick') || scriptContent.includes('app')) {
          console.log('包含novel/quick/app关键词，内容片段:');
          console.log(scriptContent.substring(0, 200) + '...');
        }
      }
    }
    
    // 查看所有链接
    console.log('\n查看所有链接...');
    const links = $('a');
    console.log(`找到 ${links.length} 个链接`);
    
    // 查看前10个链接
    for (let i = 0; i < Math.min(10, links.length); i++) {
      const href = $(links[i]).attr('href');
      const text = $(links[i]).text().trim();
      console.log(`链接 ${i+1}: ${text} - ${href}`);
    }
    
    // 查找可能包含短剧列表的元素
    console.log('\n查找可能包含短剧列表的元素...');
    const possibleContainers = ['.container', '.main', '.content', '.wrapper', '.list', '.series'];
    
    for (const selector of possibleContainers) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`${selector}: ${elements.length} 个元素`);
        // 查看第一个元素的HTML结构
        if (elements.length > 0) {
          const html = $(elements[0]).html();
          if (html) {
            console.log(`${selector} 第一个元素的HTML片段: ${html.substring(0, 300)}...`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

checkNovelQuickApp();
