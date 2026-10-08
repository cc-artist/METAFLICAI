# 爬虫获取有效影视资源并正确发布的技术方案

## 1. 概述

本方案旨在解决爬虫无法获取有效影视资源并正确发布的问题，同时禁止使用任何样本视频。通过优化爬虫架构、多源爬取策略、视频验证机制和智能分类算法，确保爬虫能够从真实网站获取符合分类的有效视频资源。

## 2. 问题分析

### 2.1 当前问题
- 爬虫从archive.org获取资源时遇到网络重试问题
- 视频资源数量不足，无法满足用户需求
- 分类算法需要优化，确保视频资源被正确分类
- 缺乏有效的视频URL验证机制

### 2.2 限制条件
- 禁止使用任何样本视频库
- 只允许从真实网站爬取资源
- 视频资源必须符合分类要求
- 必须确保视频URL有效

## 3. 技术方案

### 3.1 爬虫架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                         爬虫服务层                               │
├─────────────────────────────────────────────────────────────────┤
│  多源爬取器  │  视频验证器  │  智能分类器  │  数据存储管理器  │
└──────────────┴──────────────┴──────────────┴───────────────────┘
         │              │              │              │
         └──────────────┼──────────────┼──────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         数据处理层                               │
├─────────────────────────────────────────────────────────────────┤
│  URL提取器  │  内容解析器  │  元数据提取器  │  去重处理器  │
└──────────────┴──────────────┴──────────────────┴────────────────┘
         │              │              │              │
         └──────────────┼──────────────┼──────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API服务层                               │
├─────────────────────────────────────────────────────────────────┤
│  GET /api/v1/videos  │  GET /api/v1/videos/:id  │  GET /api/v1/categories  │
└──────────────────────┴──────────────────────────┴─────────────────────────┘
```

### 3.2 多源爬取策略

#### 3.2.1 爬取网站列表

| 网站名称 | URL | 资源类型 | 爬取策略 |
|---------|-----|---------|---------|
| Internet Archive | https://archive.org/details/movies | 公共领域电影 | 深度优先，每页20条 |
| Public Domain Movie | https://www.publicdomainmovie.net/ | 公共领域电影 | 广度优先，每页15条 |
| Archive.org TV | https://archive.org/details/tv | 公共领域电视节目 | 深度优先，每页15条 |
| Open Culture | https://www.openculture.com/free-movies-online | 免费电影 | 广度优先，每页10条 |
| Public Domain Torrents | https://www.publicdomaintorrents.info/ | 公共领域电影 | 深度优先，每页10条 |

#### 3.2.2 爬取频率控制

- 每个网站的爬取间隔：5秒
- 每个视频详情页的爬取间隔：2秒
- 每天最大爬取数量：1000条
- 自动爬取间隔：30分钟

#### 3.2.3 错误处理和重试机制

- 网络错误重试：3次，指数退避策略
- 超时设置：15秒
- 连接池大小：10

### 3.3 视频URL验证机制

#### 3.3.1 验证流程

1. **初始验证**：检查URL格式是否合法
2. **HEAD请求验证**：发送HEAD请求检查HTTP状态码和Content-Type
3. **内容类型验证**：确保Content-Type为video/*或application/vnd.apple.mpegurl
4. **大小验证**：确保视频大小大于1MB
5. **播放验证**：尝试使用FFmpeg或其他工具验证视频可以正常播放

#### 3.3.2 验证规则

| 验证项 | 规则 | 结果 |
|-------|------|------|
| URL格式 | 必须为合法URL | 合法/非法 |
| HTTP状态码 | 200-399 | 有效/无效 |
| Content-Type | video/* 或 application/vnd.apple.mpegurl | 有效/无效 |
| 视频大小 | >1MB | 有效/无效 |
| 播放验证 | 可以正常播放 | 有效/无效 |

### 3.4 智能分类算法

#### 3.4.1 分类体系

| 分类名称 | 关键词 | 排除关键词 | 最大时长 | 最小时长 |
|---------|-------|-----------|---------|---------|
| 短剧 | 短剧, 短剧集, 迷你剧, 微短剧, 重生, 穿越, 爽剧 | 电影, 电视剧, 综艺 | 1800秒 | 60秒 |
| 漫剧 | 漫剧, 动画微短剧, 动态漫画, 有声漫画, AI漫剧, 动画, 动漫 | 综艺, 真人秀 | 3600秒 | 60秒 |
| 综艺 | 综艺, 真人秀, 脱口秀, 游戏节目, 选秀, 竞赛, 访谈 | 动画, 动漫, 电影 | 7200秒 | 300秒 |
| 赛事&演出 | 赛事, 演出, 演唱会, 音乐会, 体育, 比赛, 表演, live | 电视剧, 电影, 综艺 | 10800秒 | 300秒 |
| 超级IP | 超级IP, IP改编, 经典改编, 名著改编, 热门小说, 爆款IP | 原创, 独立制作 | 7200秒 | 600秒 |
| 高概念 | 高概念, 科幻, 奇幻, 超现实, 未来, 太空, 宇宙, 科技, 异能 | 家庭, 现实, 纪录片 | 7200秒 | 600秒 |
| 合家欢 | 合家欢, 家庭, 亲情, 友情, 爱情, 喜剧, 温馨, 治愈, 亲子 | 恐怖, 悬疑, 惊悚 | 7200秒 | 300秒 |

#### 3.4.2 分类流程

1. **关键词匹配**：根据标题、描述和标签匹配分类关键词
2. **排除关键词检查**：确保不包含排除关键词
3. **时长验证**：检查视频时长是否符合分类要求
4. **内容分析**：使用NLP技术分析视频内容，确定分类
5. **人工校正机制**：允许管理员手动校正分类

### 3.5 数据存储和发布机制

#### 3.5.1 数据模型

```typescript
interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  category: string;
  subCategory: string;
  tags: string[];
  source: string;
  language: string;
  releaseDate: Date;
  releaseYear: number;
  rating: number;
  viewCount: number;
  likes: number;
  isActive: boolean;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.5.2 发布流程

1. **爬取数据**：从网站爬取视频数据
2. **数据清洗**：去除重复数据，提取有效信息
3. **视频验证**：验证视频URL是否有效
4. **智能分类**：将视频资源分类到合适的分类
5. **数据存储**：将视频资源存储到内存或数据库
6. **API发布**：通过API端点发布视频资源

## 4. 实现方案

### 4.1 爬虫服务优化

#### 4.1.1 修改`crawlFromOtherSources`函数

```typescript
export const crawlFromOtherSources = async (): Promise<any[]> => {
  try {
    console.log('🚀 正在从其他网站获取影视资源...');
    
    const allCrawledVideos: any[] = [];
    const seenTitles = new Set<string>();
    
    // 扩展要爬取的网站列表
    const otherSites: string[] = [
      'https://archive.org/details/movies', // Internet Archive电影频道
      'https://archive.org/details/tv', // Internet Archive电视节目频道
      'https://www.publicdomainmovie.net/', // 公共领域电影网站
      'https://www.openculture.com/free-movies-online', // Open Culture免费电影
      'https://www.publicdomaintorrents.info/' // 公共领域种子网站
    ];
    
    // 遍历每个网站进行爬取
    for (const site of otherSites) {
      try {
        console.log(`📥 正在爬取网站: ${site}`);
        
        // 根据不同网站实现特定的爬取逻辑
        let siteVideos: any[] = [];
        
        if (site.includes('archive.org/details/movies')) {
          // 爬取Internet Archive电影频道
          siteVideos = await crawlFromArchiveOrg(site, seenTitles);
        } else if (site.includes('archive.org/details/tv')) {
          // 爬取Internet Archive电视节目频道
          siteVideos = await crawlFromArchiveTV(site, seenTitles);
        } else if (site.includes('publicdomainmovie.net')) {
          // 爬取公共领域电影网站
          siteVideos = await crawlFromPublicDomainMovie(site, seenTitles);
        } else if (site.includes('openculture.com')) {
          // 爬取Open Culture免费电影
          siteVideos = await crawlFromOpenCulture(site, seenTitles);
        } else if (site.includes('publicdomaintorrents.info')) {
          // 爬取公共领域种子网站
          siteVideos = await crawlFromPublicDomainTorrents(site, seenTitles);
        }
        
        allCrawledVideos.push(...siteVideos);
        console.log(`✅ 从${site}获取到 ${siteVideos.length} 个视频资源`);
        
        // 控制爬取速度
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.warn(`⚠️ 从${site}爬取失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log(`🎉 从其他网站共获取到 ${allCrawledVideos.length} 个视频资源`);
    return allCrawledVideos;
  } catch (error) {
    console.error(`❌ 从其他网站获取视频资源失败: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
};
```

#### 4.1.2 优化视频URL验证函数

```typescript
// 视频URL验证函数
const validateVideoUrl = async (url: string): Promise<boolean> => {
  try {
    console.log(`🔍 正在验证视频URL: ${url}`);
    
    // 1. 初始验证 - 检查URL格式
    try {
      new URL(url);
    } catch (e) {
      console.warn(`❌ 无效的URL格式: ${url}`);
      return false;
    }
    
    // 2. HEAD请求验证
    const response = await axiosInstance.head(url, {
      timeout: 10000
    });
    
    // 检查响应状态码
    if (response.status < 200 || response.status >= 400) {
      console.warn(`❌ 视频URL返回错误状态码: ${response.status} - ${url}`);
      return false;
    }
    
    // 3. 内容类型验证
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('video/') && !contentType.includes('application/vnd.apple.mpegurl')) {
      console.warn(`❌ 不是视频类型: ${contentType} - ${url}`);
      return false;
    }
    
    // 4. 大小验证
    const contentLength = parseInt(response.headers['content-length'] || '0');
    if (contentLength > 0 && contentLength < 1024 * 1024) { // 小于1MB
      console.warn(`❌ 视频大小太小: ${contentLength} bytes - ${url}`);
      return false;
    }
    
    console.log(`✅ 视频URL验证通过: ${url}`);
    return true;
  } catch (error) {
    console.warn(`❌ 视频URL验证失败: ${error instanceof Error ? error.message : String(error)} - ${url}`);
    return false;
  }
};
```

#### 4.1.3 改进智能分类函数

```typescript
/**
 * 根据标题和描述智能分类视频
 */
const getCategoryFromTitleAndDescription = (title: string, description: string, duration: number): string => {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();
  const allTextLower = `${lowerTitle} ${lowerDesc}`;
  
  // 定义分类规则
  const categoryRules: Array<{
    name: string;
    keywords: string[];
    excludeKeywords: string[];
    maxDuration?: number;
    minDuration?: number;
  }> = [
    {
      name: '短剧',
      keywords: ['短剧', '短剧集', '迷你剧', '微短剧', '重生', '穿越', '爽剧'],
      excludeKeywords: ['电影', '电视剧', '综艺'],
      maxDuration: 1800, // 30分钟
      minDuration: 60 // 1分钟
    },
    {
      name: '漫剧',
      keywords: ['漫剧', '动画微短剧', '动态漫画', '有声漫画', 'AI漫剧', '动画', '动漫'],
      excludeKeywords: ['综艺', '真人秀'],
      maxDuration: 3600, // 1小时
      minDuration: 60 // 1分钟
    },
    {
      name: '综艺',
      keywords: ['综艺', '真人秀', '脱口秀', '游戏节目', '选秀', '竞赛', '访谈'],
      excludeKeywords: ['动画', '动漫', '电影'],
      maxDuration: 7200, // 2小时
      minDuration: 300 // 5分钟
    },
    {
      name: '赛事&演出',
      keywords: ['赛事', '演出', '演唱会', '音乐会', '体育', '比赛', '表演', 'live'],
      excludeKeywords: ['电视剧', '电影', '综艺'],
      maxDuration: 10800, // 3小时
      minDuration: 300 // 5分钟
    },
    {
      name: '超级IP',
      keywords: ['超级IP', 'IP改编', '经典改编', '名著改编', '热门小说', '爆款IP'],
      excludeKeywords: ['原创', '独立制作'],
      maxDuration: 7200, // 2小时
      minDuration: 600 // 10分钟
    },
    {
      name: '高概念',
      keywords: ['高概念', '科幻', '奇幻', '超现实', '未来', '太空', '宇宙', '科技', '异能'],
      excludeKeywords: ['家庭', '现实', '纪录片'],
      maxDuration: 7200, // 2小时
      minDuration: 600 // 10分钟
    },
    {
      name: '合家欢',
      keywords: ['合家欢', '家庭', '亲情', '友情', '爱情', '喜剧', '温馨', '治愈', '亲子'],
      excludeKeywords: ['恐怖', '悬疑', '惊悚'],
      maxDuration: 7200, // 2小时
      minDuration: 300 // 5分钟
    }
  ];
  
  // 遍历分类规则，找到匹配的分类
  for (const rule of categoryRules) {
    // 检查关键词
    const hasKeyword = rule.keywords.some(keyword => allTextLower.includes(keyword));
    if (!hasKeyword) continue;
    
    // 检查排除关键词
    const hasExcludeKeyword = rule.excludeKeywords.some(keyword => allTextLower.includes(keyword));
    if (hasExcludeKeyword) continue;
    
    // 检查时长
    const durationValid = 
      (!rule.maxDuration || duration <= rule.maxDuration) && 
      (!rule.minDuration || duration >= rule.minDuration);
    if (!durationValid) continue;
    
    return rule.name;
  }
  
  // 默认分类
  if (duration <= 1800) {
    return '短剧';
  } else if (allTextLower.includes('动画') || allTextLower.includes('动漫')) {
    return '漫剧';
  } else {
    return '高概念';
  }
};
```

### 3.5 监控和日志系统

#### 3.5.1 日志级别

- **DEBUG**：详细的调试信息
- **INFO**：正常的运行信息
- **WARN**：警告信息
- **ERROR**：错误信息

#### 3.5.2 监控指标

| 指标名称 | 描述 | 单位 |
|---------|------|------|
| 爬取网站数量 | 已爬取的网站数量 | 个 |
| 爬取视频数量 | 已爬取的视频数量 | 个 |
| 有效视频数量 | 验证通过的视频数量 | 个 |
| 无效视频数量 | 验证失败的视频数量 | 个 |
| 分类成功率 | 成功分类的视频比例 | % |
| 爬取成功率 | 成功爬取的网站比例 | % |
| 平均爬取时间 | 平均每个视频的爬取时间 | 秒 |
| 平均验证时间 | 平均每个视频的验证时间 | 秒 |

## 4. 实施计划

### 4.1 阶段一：基础架构优化（1-2天）
- 扩展爬取网站列表
- 优化视频URL验证机制
- 改进智能分类算法

### 4.2 阶段二：多源爬取实现（2-3天）
- 实现各网站的爬取逻辑
- 添加错误处理和重试机制
- 实现爬取频率控制

### 4.3 阶段三：视频验证和分类（1-2天）
- 实现完整的视频URL验证机制
- 优化智能分类算法
- 添加人工校正机制

### 4.4 阶段四：监控和日志（1天）
- 添加详细的日志记录
- 实现监控指标采集
- 开发监控 dashboard

### 4.5 阶段五：测试和优化（2-3天）
- 测试各网站的爬取效果
- 优化爬取策略
- 调整分类规则
- 修复bug

## 5. 测试和验证

### 5.1 单元测试
- 测试视频URL验证函数
- 测试智能分类算法
- 测试各网站的爬取逻辑

### 5.2 集成测试
- 测试完整的爬取流程
- 测试API发布机制
- 测试监控和日志系统

### 5.3 性能测试
- 测试爬取速度
- 测试视频验证性能
- 测试分类算法性能

### 5.4 验证标准
- 每个分类至少有10个有效视频资源
- 视频URL验证成功率 >= 90%
- 分类准确率 >= 85%
- 爬取成功率 >= 95%

## 6. 风险评估

### 6.1 风险列表

| 风险名称 | 风险级别 | 影响 | 缓解措施 |
|---------|---------|------|----------|
| 网站反爬机制 | 高 | 无法爬取资源 | 使用随机User-Agent、代理IP、爬取间隔控制 |
| 网络不稳定 | 中 | 爬取失败率高 | 添加重试机制、指数退避策略 |
| 视频URL失效 | 中 | 播放失败 | 定期验证视频URL、添加失效检测机制 |
| 分类不准确 | 中 | 用户体验差 | 优化分类算法、添加人工校正机制 |
| 资源数量不足 | 低 | 无法满足用户需求 | 扩展爬取网站列表、优化爬取策略 |

### 6.2 应急方案

- 当某个网站无法爬取时，自动切换到其他网站
- 当视频URL验证失败时，自动删除该视频资源
- 当分类准确率低于阈值时，发送告警通知
- 当资源数量不足时，增加爬取频率

## 7. 结论

本方案通过优化爬虫架构、多源爬取策略、视频验证机制和智能分类算法，确保爬虫能够从真实网站获取符合分类的有效视频资源，同时禁止使用任何样本视频。通过实施本方案，可以解决当前爬虫无法获取有效影视资源并正确发布的问题，提高用户体验。

## 8. 后续改进方向

- 引入机器学习算法，提高分类准确率
- 实现分布式爬取，提高爬取效率
- 添加视频质量评估机制
- 实现自动更新和维护机制
- 添加用户反馈机制，优化分类规则
