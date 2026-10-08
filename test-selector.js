const axios = require('axios');
const cheerio = require('cheerio');

// 测试 PublicDomainMovie.net 的选择器
async function testPublicDomainMovieSelector() {
  try {
    console.log('📥 正在测试 PublicDomainMovie.net 的选择器...');
    
    const response = await axios.get('https://www.publicdomainmovie.net/');
    const html = response.data;
    const $ = cheerio.load(html);
    
    console.log('✅ 成功获取网站内容');
    
    // 测试不同的选择器
    console.log('\n🔍 测试不同的选择器:');
    
    // 我们当前使用的选择器
    const currentSelector = $('.movie-list .movie-item');
    console.log(`📺 当前选择器 ('.movie-list .movie-item') 找到 ${currentSelector.length} 个视频项`);
    
    // 测试body下的所有元素，看看网站结构
    const allDivs = $('div');
    console.log(`📋 找到 ${allDivs.length} 个 div 元素`);
    
    // 查看前10个div的class和id
    console.log('\n📋 前10个div的class和id:');
    allDivs.slice(0, 10).each((index, div) => {
      const className = $(div).attr('class') || '无class';
      const id = $(div).attr('id') || '无id';
      console.log(`${index + 1}. class: ${className}, id: ${id}`);
    });
    
    // 查找所有带有movie相关class的元素
    const movieElements = $('[class*=movie]');
    console.log(`\n📋 找到 ${movieElements.length} 个带有movie相关class的元素`);
    
    // 查看这些元素的class和html内容
    console.log('\n📋 带有movie相关class的元素:');
    movieElements.slice(0, 10).each((index, element) => {
      const className = $(element).attr('class') || '无class';
      const html = $(element).html().trim().substring(0, 100) + '...';
      console.log(`${index + 1}. class: ${className}`);
      console.log(`   HTML: ${html}`);
    });
    
    // 查看整个网站的基本结构
    console.log('\n📋 网站基本结构:');
    const mainContent = $('body').html().substring(0, 500) + '...';
    console.log(mainContent);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📊 响应状态码:', error.response.status);
      console.error('📋 响应头:', error.response.headers);
      console.error('📝 响应体:', error.response.data.substring(0, 500) + '...');
    }
  }
}

// 测试 archive.org 的选择器
async function testArchiveOrgSelector() {
  try {
    console.log('\n\n📥 正在测试 archive.org 的选择器...');
    
    const response = await axios.get('https://archive.org/details/movies');
    const html = response.data;
    const $ = cheerio.load(html);
    
    console.log('✅ 成功获取网站内容');
    
    // 我们当前使用的选择器
    const currentSelector = $('.item-ia');
    console.log(`📺 当前选择器 ('.item-ia') 找到 ${currentSelector.length} 个视频项`);
    
    // 测试body下的所有元素，看看网站结构
    const allDivs = $('div');
    console.log(`📋 找到 ${allDivs.length} 个 div 元素`);
    
    // 查找所有带有item相关class的元素
    const itemElements = $('[class*=item]');
    console.log(`📋 找到 ${itemElements.length} 个带有item相关class的元素`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📊 响应状态码:', error.response.status);
    }
  }
}

// 执行测试
testPublicDomainMovieSelector().then(() => {
  testArchiveOrgSelector();
});
