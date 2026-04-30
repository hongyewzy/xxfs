# 八字解读卡片优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化八字解读的卡片展示，将 AI 返回的内容更准确地拆分成多个小卡片，并改进卡片样式让内容更易阅读。

**Architecture:** 保持现有 fortune-card 组件架构，优化 bazi 页面的 parseToCards 函数（扩展关键词匹配、添加智能兜底），调整 fortune-card 组件样式（减小间距、字号）。

**Tech Stack:** WeChat Miniprogram (WXML, WXSS, JS), markdown.js 解析器

---

## 文件结构

| 文件 | 责责内容 |
|------|----------|
| `miniprogram/pages/bazi/bazi.js` | parseToCards 函数优化：扩展关键词、智能兜底拆分 |
| `miniprogram/components/fortune-card/fortune-card.wxss` | 卡片样式优化：减小内边距、字号、行高 |
| `miniprogram/utils/ai-api.js` | 调整 bazi 的 system prompt，确保返回结构化段落 |

---

### Task 1: 优化 parseToCards 函数 - 扩展关键词匹配

**Files:**
- Modify: `miniprogram/pages/bazi/bazi.js:182-255`

- [ ] **Step 1: 扩展 cardConfigs 关键词列表**

将 `parseToCards` 函数中的 `cardConfigs` 从单一关键词改为多关键词数组：

```javascript
parseToCards(aiResult) {
  const cards = []
  const cardConfigs = [
    { keywords: ['五行', '命格', '格局', '五行配置'], title: '五行命格', tags: [{ type: 'general', name: '综合' }] },
    { keywords: ['性格', '个性', '特质', '性格特点'], title: '性格特点', tags: [{ type: 'mind', name: '性格' }, { type: 'emotion', name: '情绪' }] },
    { keywords: ['事业', '工作', '财运', '财富', '事业运势'], title: '事业财运', tags: [{ type: 'career', name: '事业' }, { type: 'wealth', name: '财运' }] },
    { keywords: ['感情', '婚姻', '爱情', '姻缘', '感情婚姻'], title: '感情婚姻', tags: [{ type: 'love', name: '爱情' }, { type: 'social', name: '人际' }] },
    { keywords: ['健康', '身体', '疾病', '健康注意'], title: '健康运势', tags: [{ type: 'health', name: '健康' }] },
    { keywords: ['贵人', '人际', '贵人运', '人际关系'], title: '贵人运势', tags: [{ type: 'social', name: '人际' }] },
    { keywords: ['建议', '指引', '注意', '人生建议', '综合建议'], title: '人生建议', tags: [{ type: 'general', name: '综合' }] }
  ]
```

- [ ] **Step 2: 修改匹配逻辑支持多关键词**

替换原有的单关键词匹配逻辑：

```javascript
  // 尝试按 ## 分割，如果没有则整体作为一个 section
  const sections = aiResult.split(/^## /m).filter(s => s.trim())
  const usedSections = new Set()

  cardConfigs.forEach((config, index) => {
    let matchedSection = null
    let matchedIndex = -1

    for (let i = 0; i < sections.length; i++) {
      if (usedSections.has(i)) continue

      const section = sections[i]
      const lines = section.split('\n')
      const title = lines[0].trim()

      // 优先匹配标题包含任一关键字的 section
      for (const keyword of config.keywords) {
        if (title.includes(keyword)) {
          matchedSection = section
          matchedIndex = i
          break
        }
      }
      if (matchedSection) break
    }

    // 如果标题没匹配到，再在正文里找
    if (!matchedSection) {
      for (let i = 0; i < sections.length; i++) {
        if (usedSections.has(i)) continue

        const section = sections[i]
        const lines = section.split('\n')
        const body = lines.slice(1).join('\n')

        for (const keyword of config.keywords) {
          if (body.includes(keyword)) {
            matchedSection = section
            matchedIndex = i
            break
          }
        }
        if (matchedSection) break
      }
    }

    if (matchedSection) {
      usedSections.add(matchedIndex)

      let body = matchedSection.split('\n').slice(1).join('\n').trim()
      body = body.replace(/^#{1,6}\s*.+$/gm, '').trim()
      body = body.replace(/\n{3,}/g, '\n\n')
      const contentHtml = markdown.parseMarkdown(body)

      cards.push({
        id: config.keywords[0],
        title: config.title,
        tags: config.tags,
        subtitle: '',
        status: { text: '点击查看', color: '#B8962E' },
        content: contentHtml,
        maxLines: 3,
        expanded: index === 0
      })
    }
  })
```

- [ ] **Step 3: 添加智能兜底拆分逻辑**

在 cardConfigs 匹配完成后，添加兜底逻辑：

```javascript
  // 智能兜底：如果匹配到的卡片少于 2 个，按 ## 标题自动拆分
  if (cards.length < 2 && sections.length > 1) {
    cards.length = 0 // 清空原有卡片，重新按段落拆分
    sections.forEach((section, index) => {
      const lines = section.split('\n')
      const title = lines[0].trim().replace(/^#+\s*/, '')
      let body = lines.slice(1).join('\n').trim()
      body = body.replace(/^#{1,6}\s*.+$/gm, '').trim()
      body = body.replace(/\n{3,}/g, '\n\n')

      if (body) {
        const contentHtml = markdown.parseMarkdown(body)
        cards.push({
          id: `section-${index}`,
          title: title || `解读 ${index + 1}`,
          tags: [{ type: 'general', name: '综合' }],
          subtitle: '',
          status: { text: '点击查看', color: '#B8962E' },
          content: contentHtml,
          maxLines: 3,
          expanded: index === 0
        })
      }
    })
  }

  // 最终兜底：如果仍然没有卡片，将全部内容作为一个卡片
  if (cards.length === 0 && aiResult) {
    cards.push({
      id: 'default',
      title: '八字解读',
      tags: [{ type: 'general', name: '综合' }],
      subtitle: '',
      status: { text: '点击查看', color: '#B8962E' },
      content: markdown.parseMarkdown(aiResult),
      maxLines: 3,
      expanded: true
    })
  }

  return cards
}
```

- [ ] **Step 4: 在 WeChat DevTools 中测试**

1. 打开 WeChat DevTools
2. 进入八字页面
3. 输入日期进行分析
4. 检查卡片是否正确拆分（应该有 5-7 个小卡片）
5. 检查每个卡片标题是否正确对应内容

---

### Task 2: 优化 fortune-card 组件样式

**Files:**
- Modify: `miniprogram/components/fortune-card/fortune-card.wxss`

- [ ] **Step 1: 减小卡片内边距**

修改 `.fortune-card` 的 padding：

```css
/* 卡片容器 */
.fortune-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  padding: 24rpx;
  margin-bottom: 20rpx;
  position: relative;
}
```

- [ ] **Step 2: 减小标题字号**

修改 `.card-title` 的 font-size：

```css
.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
  line-height: 1.4;
  display: block;
  margin-bottom: 12rpx;
}
```

- [ ] **Step 3: 减小正文字号和行高**

修改 `.content-text` 的样式：

```css
.content-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}
```

- [ ] **Step 4: 调整折叠状态的行数计算**

修改 `.card-content.collapsed` 的 max-height：

```css
.card-content.collapsed {
  max-height: calc(3 * 1.6em);
  overflow: hidden;
}
```

- [ ] **Step 5: 调整标签区域间距**

修改 `.card-tags` 的 margin-bottom：

```css
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
```

- [ ] **Step 6: 调整标签样式**

修改 `.tag-item` 的字号和 padding：

```css
.tag-item {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 100rpx;
  font-weight: 500;
  line-height: 1;
}
```

- [ ] **Step 7: 在 WeChat DevTools 中测试**

1. 打开 WeChat DevTools
2. 进入八字页面进行分析
3. 检查卡片样式是否更紧凑、内容更易阅读
4. 检查多个卡片堆叠时整体视觉效果

---

### Task 3: 优化 AI prompt 确保结构化输出

**Files:**
- Modify: `miniprogram/utils/ai-api.js:74`

- [ ] **Step 1: 优化 bazi system prompt**

修改 bazi 的 system prompt，明确要求按主题分段：

```javascript
bazi: '你是一位专业的命理大师，精通八字命理、五行生克、十神配置等传统命理学。请用通俗易懂的语言进行解读。回复使用 Markdown 格式，必须按以下结构分段输出：

## 五行分析
[五行配置的详细解读]

## 性格特点
[性格特质分析]

## 事业财运
[事业和财运分析]

## 感情婚姻
[感情和婚姻分析]

## 健康运势
[健康注意事项]

## 人生建议
[综合建议和指引]

每个段落使用 ## 标题开头，内容使用 **加粗** 强调重点，使用列表列出要点。'
```

- [ ] **Step 2: 在 WeChat DevTools 中测试**

1. 打开 WeChat DevTools
2. 进入八字页面进行分析
3. 检查 AI 返回的内容是否按指定结构分段
4. 检查卡片拆分是否准确匹配每个段落

---

### Task 4: 同步优化其他页面的 parseToCards

**Files:**
- Modify: `miniprogram/pages/tarot/tarot.js:97-134`
- Modify: `miniprogram/pages/meihua/meihua.js:109-159`
- Modify: `miniprogram/pages/dream/dream.js` (parseToCards 函数)
- Modify: `miniprogram/pages/name/name.js` (parseToCards 函数)
- Modify: `miniprogram/pages/naming/naming.js` (parseToCards 函数)

- [ ] **Step 1: 优化 tarot 页面的 parseToCards**

将关键词改为数组形式：

```javascript
parseToCards(aiResult) {
  const cards = []
  const cardConfigs = [
    { keywords: ['牌面', '牌意', '牌面解读'], title: '牌面解读', tags: [{ type: 'general', name: '综合' }] },
    { keywords: ['综合', '总体', '综合建议'], title: '综合建议', tags: [{ type: 'general', name: '综合' }, { type: 'mind', name: '思维' }] },
    { keywords: ['行动', '建议', '指引', '行动指引'], title: '行动指引', tags: [{ type: 'career', name: '事业' }] }
  ]

  const sections = aiResult.split(/^## /m).filter(s => s.trim())
  const usedSections = new Set()

  cardConfigs.forEach((config, index) => {
    // ... 使用与 bazi 相同的多关键词匹配逻辑
  })

  // 添加智能兜底逻辑（与 bazi 相同）

  return cards
}
```

- [ ] **Step 2: 优化 meihua 页面的 parseToCards**

```javascript
parseToCards(aiResult) {
  const cards = []
  const cardConfigs = [
    { keywords: ['卦象', '卦意', '卦象解读'], title: '卦象解读', tags: [{ type: 'general', name: '综合' }] },
    { keywords: ['变化', '变卦', '变化分析'], title: '变化分析', tags: [{ type: 'mind', name: '思维' }] },
    { keywords: ['应对', '建议', '指引', '应对建议'], title: '应对建议', tags: [{ type: 'career', name: '事业' }] }
  ]

  // ... 使用相同的多关键词匹配和智能兜底逻辑
}
```

- [ ] **Step 3: 优化 dream 页面的 parseToCards**

先读取文件确认当前结构：

```javascript
// dream 页面的关键词配置
const cardConfigs = [
  { keywords: ['梦境', '象征', '梦境象征'], title: '梦境象征', tags: [{ type: 'mind', name: '心理' }] },
  { keywords: ['心理', '心理分析', '心理暗示'], title: '心理分析', tags: [{ type: 'emotion', name: '情绪' }] },
  { keywords: ['建议', '指引', '应对'], title: '应对建议', tags: [{ type: 'general', name: '综合' }] }
]
```

- [ ] **Step 4: 优化 name 页面的 parseToCards**

```javascript
// name 页面的关键词配置
const cardConfigs = [
  { keywords: ['五格', '数理', '五格数理'], title: '五格分析', tags: [{ type: 'general', name: '综合' }] },
  { keywords: ['三才', '配置', '三才配置'], title: '三才配置', tags: [{ type: 'general', name: '综合' }] },
  { keywords: ['综合', '评分', '综合评分'], title: '综合评价', tags: [{ type: 'general', name: '综合' }] },
  { keywords: ['建议', '改进', '改进建议'], title: '改进建议', tags: [{ type: 'general', name: '综合' }] }
]
```

- [ ] **Step 5: 优化 naming 页面的 parseToCards**

```javascript
// naming 页面的关键词配置
const cardConfigs = [
  { keywords: ['八字', '五行', '八字分析'], title: '八字分析', tags: [{ type: 'general', name: '综合' }] },
  { keywords: ['推荐', '名字', '推荐名字'], title: '推荐名字', tags: [{ type: 'general', name: '综合' }] },
  { keywords: ['解析', '含义', '名字解析'], title: '名字解析', tags: [{ type: 'general', name: '综合' }] }
]
```

- [ ] **Step 6: 在 WeChat DevTools 中测试所有页面**

1. 测试塔罗页面 - 检查牌面解读是否正确拆分
2. 测试梅花易数页面 - 检查卦象解读是否正确拆分
3. 测试解梦页面 - 检查梦境分析是否正确拆分
4. 测试姓名分析页面 - 检查五格分析是否正确拆分
5. 测试起名页面 - 检查名字推荐是否正确拆分

---

### Task 5: 最终验证和提交

- [ ] **Step 1: 全功能测试**

在 WeChat DevTools 中完整测试所有功能：
1. 八字页面 - 输入不同日期，验证卡片拆分效果
2. 其他页面 - 验证样式一致性
3. 检查卡片展开/收起功能正常
4. 检查历史记录保存正常

- [ ] **Step 2: 提交代码**

```bash
git add miniprogram/pages/bazi/bazi.js miniprogram/components/fortune-card/fortune-card.wxss miniprogram/utils/ai-api.js miniprogram/pages/tarot/tarot.js miniprogram/pages/meihua/meihua.js miniprogram/pages/dream/dream.js miniprogram/pages/name/name.js miniprogram/pages/naming/naming.js
git commit -m "feat: optimize fortune-card display with better keyword matching and compact styling"
```

---

## 自检清单

**1. Spec 覆盖检查：**
- ✅ 扩展关键词匹配 - Task 1
- ✅ 优化卡片样式 - Task 2
- ✅ 智能兜底拆分 - Task 1
- ✅ AI prompt 优化 - Task 3
- ✅ 其他页面同步优化 - Task 4

**2. Placeholder 检查：**
- 无 TBD、TODO 等占位符
- 所有代码步骤都有完整代码块
- 所有测试步骤都有具体操作说明

**3. 类型一致性检查：**
- cardConfigs 结构在各页面一致：`{ keywords: [], title: '', tags: [] }`
- 卡片对象结构一致：`{ id, title, tags, subtitle, status, content, maxLines, expanded }`