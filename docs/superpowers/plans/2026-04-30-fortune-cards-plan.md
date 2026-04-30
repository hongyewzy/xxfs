# 运势卡片组件重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将所有页面的 AI 解读卡片改为测测App风格的运势卡片组件

**Architecture:** 创建新的 `fortune-card` 组件替代现有 `analysis-card`，支持彩色标签胶囊、进度条装饰、内容截断展开等交互。样式写入全局 theme.wxss，各页面数据格式适配新结构。

**Tech Stack:** 微信小程序原生开发（WXML + WXSS + JS）

---

## 文件结构

### 新建文件
- `miniprogram/components/fortune-card/fortune-card.js` - 组件逻辑
- `miniprogram/components/fortune-card/fortune-card.wxml` - 组件模板
- `miniprogram/components/fortune-card/fortune-card.wxss` - 组件样式
- `miniprogram/components/fortune-card/fortune-card.json` - 组件配置

### 修改文件
- `miniprogram/styles/theme.wxss` - 添加卡片基础样式
- `miniprogram/pages/bazi/bazi.js` - 数据格式适配
- `miniprogram/pages/bazi/bazi.wxml` - 使用新组件
- `miniprogram/pages/tarot/tarot.js` - 数据格式适配
- `miniprogram/pages/tarot/tarot.wxml` - 使用新组件
- `miniprogram/pages/dream/dream.js` - 数据格式适配
- `miniprogram/pages/dream/dream.wxml` - 使用新组件
- `miniprogram/pages/meihua/meihua.js` - 数据格式适配
- `miniprogram/pages/meihua/meihua.wxml` - 使用新组件
- `miniprogram/pages/name/name.js` - 数据格式适配
- `miniprogram/pages/name/name.wxml` - 使用新组件
- `miniprogram/pages/naming/naming.js` - 数据格式适配
- `miniprogram/pages/naming/naming.wxml` - 使用新组件

---

## Task 1: 创建 fortune-card 组件基础结构

**Files:**
- Create: `miniprogram/components/fortune-card/fortune-card.json`
- Create: `miniprogram/components/fortune-card/fortune-card.js`
- Create: `miniprogram/components/fortune-card/fortune-card.wxml`
- Create: `miniprogram/components/fortune-card/fortune-card.wxss`

### Step 1.1: 创建组件配置文件

- [ ] **编写 fortune-card.json**

```json
{
  "component": true,
  "usingComponents": {}
}
```

### Step 1.2: 编写组件 JS 逻辑

- [ ] **编写 fortune-card.js**

```javascript
Component({
  properties: {
    card: {
      type: Object,
      value: {}
    },
    showFooter: {
      type: Boolean,
      value: true
    },
    showProgress: {
      type: Boolean,
      value: true
    }
  },

  data: {
    isExpanded: false,
    isTruncated: false
  },

  lifetimes: {
    attached() {
      this.setData({
        isExpanded: this.properties.card.expanded || false
      })
    }
  },

  methods: {
    toggleExpand() {
      this.setData({
        isExpanded: !this.data.isExpanded
      })
    },

    onTagTap(e) {
      const { type } = e.currentTarget.dataset
      this.triggerEvent('tagtap', { type })
    },

    onFooterTap() {
      this.triggerEvent('footertap', { card: this.properties.card })
    }
  }
})
```

### Step 1.3: 编写组件模板

- [ ] **编写 fortune-card.wxml**

```xml
<view class="fortune-card">
  <!-- 标签区 -->
  <view class="fortune-tags" wx:if="{{card.tags && card.tags.length > 0}}">
    <view
      class="fortune-tag {{item.type}}"
      wx:for="{{card.tags}}"
      wx:key="index"
      bindtap="onTagTap"
      data-type="{{item.type}}"
    >
      {{item.name}}
      <text class="tag-arrow">▼</text>
    </view>
  </view>

  <!-- 主标题 -->
  <view class="fortune-title">{{card.title}}</view>

  <!-- 进度条装饰 -->
  <view class="fortune-progress" wx:if="{{showProgress}}"></view>

  <!-- 副标题区 -->
  <view class="fortune-subheader" wx:if="{{card.subtitle || card.status}}">
    <text class="fortune-subtitle" wx:if="{{card.subtitle}}">{{card.subtitle}}</text>
    <text class="fortune-status" wx:if="{{card.status}}" style="color: {{card.status.color || '#2196F3'}}">
      {{card.status.text}}
    </text>
  </view>

  <!-- 正文内容 -->
  <view class="fortune-content-wrap">
    <view class="fortune-content {{isExpanded ? 'expanded' : ''}}">
      <rich-text nodes="{{card.content}}"></rich-text>
    </view>
    <view class="fortune-expand" wx:if="{{card.maxLines && !isExpanded}}" bindtap="toggleExpand">
      ...全文
    </view>
    <view class="fortune-collapse" wx:if="{{isExpanded}}" bindtap="toggleExpand">
      收起
    </view>
  </view>

  <!-- 底部信息栏 -->
  <view class="fortune-footer" wx:if="{{showFooter && card.footer}}" bindtap="onFooterTap">
    <text class="footer-icon" wx:if="{{card.footer.icon}}">{{card.footer.icon}}</text>
    <text class="footer-text">{{card.footer.text}}</text>
    <text class="footer-count" wx:if="{{card.footer.count}}">{{card.footer.count}}</text>
    <text class="footer-action" wx:if="{{card.footer.action}}">{{card.footer.action}}</text>
    <text class="footer-arrow">></text>
  </view>
</view>
```

### Step 1.4: 编写组件样式

- [ ] **编写 fortune-card.wxss**

```css
/* 卡片容器 */
.fortune-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

/* 标签区 */
.fortune-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.fortune-tag {
  display: inline-flex;
  align-items: center;
  height: 44rpx;
  padding: 0 20rpx;
  border-radius: 22rpx;
  font-size: 24rpx;
  line-height: 44rpx;
}

.tag-arrow {
  font-size: 20rpx;
  margin-left: 6rpx;
}

/* 标签配色 */
.fortune-tag.career { background: #E3F2FD; color: #2196F3; }
.fortune-tag.social { background: #E8F5E9; color: #4CAF50; }
.fortune-tag.love { background: #FCE4EC; color: #E91E63; }
.fortune-tag.mind { background: #F3E5F5; color: #9C27B0; }
.fortune-tag.emotion { background: #E0F7FA; color: #00BCD4; }
.fortune-tag.wealth { background: #FFF8E1; color: #FFA000; }
.fortune-tag.health { background: #E8EAF6; color: #3F51B5; }
.fortune-tag.general { background: #FFF3E0; color: #F57C00; }
.fortune-tag.study { background: #E0F2F1; color: #009688; }
.fortune-tag.family { background: #FCE4EC; color: #E91E63; }

/* 主标题 */
.fortune-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

/* 进度条装饰 */
.fortune-progress {
  width: 200rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: linear-gradient(90deg, #B8962E, #D4A84B);
  margin-bottom: 20rpx;
}

/* 副标题区 */
.fortune-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.fortune-subtitle {
  font-size: 26rpx;
  color: #888888;
}

.fortune-status {
  font-size: 26rpx;
}

/* 正文内容 */
.fortune-content-wrap {
  position: relative;
}

.fortune-content {
  font-size: 30rpx;
  line-height: 1.8;
  color: #333333;
  max-height: 162rpx; /* 3行高度 */
  overflow: hidden;
}

.fortune-content.expanded {
  max-height: none;
}

.fortune-content rich-text {
  display: block;
}

/* 展开/收起链接 */
.fortune-expand,
.fortune-collapse {
  display: inline;
  color: #2196F3;
  font-size: 28rpx;
  margin-left: 8rpx;
}

/* 底部信息栏 */
.fortune-footer {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F0F0;
  font-size: 26rpx;
  color: #888888;
}

.footer-icon {
  margin-right: 8rpx;
}

.footer-text {
  margin-right: 8rpx;
}

.footer-count {
  color: #333333;
  font-weight: 500;
}

.footer-action {
  margin-left: 8rpx;
}

.footer-arrow {
  margin-left: auto;
  color: #CCCCCC;
}
```

### Step 1.5: 提交组件文件

- [ ] **提交**

```bash
git add miniprogram/components/fortune-card/
git commit -m "feat: create fortune-card component"
```

---

## Task 2: 添加组件到全局配置

**Files:**
- Modify: `miniprogram/app.json`

### Step 2.1: 在 app.json 中注册组件

- [ ] **修改 app.json**

在 `usingComponents` 中添加：

```json
{
  "usingComponents": {
    "fortune-card": "components/fortune-card/fortune-card"
  }
}
```

### Step 2.2: 提交

- [ ] **提交**

```bash
git add miniprogram/app.json
git commit -m "chore: register fortune-card component globally"
```

---

## Task 3: 重构八字页面

**Files:**
- Modify: `miniprogram/pages/bazi/bazi.js`
- Modify: `miniprogram/pages/bazi/bazi.wxml`

### Step 3.1: 修改数据解析方法

- [ ] **修改 bazi.js 中的 parseToCards 方法**

将原有方法改为返回新格式：

```javascript
parseToCards(aiResult) {
  const cards = []
  const cardConfigs = [
    { keyword: '五行', title: '五行分析', tags: [{ type: 'general', name: '综合' }] },
    { keyword: '性格', title: '性格特点', tags: [{ type: 'mind', name: '性格' }, { type: 'emotion', name: '情绪' }] },
    { keyword: '事业', title: '事业运势', tags: [{ type: 'career', name: '事业' }, { type: 'wealth', name: '财运' }] },
    { keyword: '感情', title: '感情婚姻', tags: [{ type: 'love', name: '爱情' }, { type: 'social', name: '人际' }] },
    { keyword: '健康', title: '健康注意', tags: [{ type: 'health', name: '健康' }] }
  ]

  const sections = aiResult.split(/^## /m).filter(s => s.trim())

  cardConfigs.forEach((config, index) => {
    let matchedSection = ''

    for (const section of sections) {
      const lines = section.split('\n')
      const title = lines[0].trim()
      const body = lines.slice(1).join('\n')

      if (title.includes(config.keyword) || body.includes(config.keyword)) {
        matchedSection = section
        break
      }
    }

    if (matchedSection) {
      let body = matchedSection.split('\n').slice(1).join('\n').trim()
      body = body.replace(/^#{1,6}\s*.+$/gm, '').trim()
      body = body.replace(/\n{3,}/g, '\n\n')

      const contentHtml = markdown.parseMarkdown(body)

      cards.push({
        id: config.keyword,
        title: config.title,
        tags: config.tags,
        subtitle: '',
        status: { text: '点击查看', color: '#B8962E' },
        content: contentHtml,
        maxLines: 3,
        footer: {
          icon: '💬',
          text: '同类交流',
          count: Math.floor(Math.random() * 2000 + 500),
          action: '人正在讨论'
        },
        expanded: index === 0
      })
    }
  })

  return cards
}
```

### Step 3.2: 修改 WXML 使用新组件

- [ ] **修改 bazi.wxml**

将原来的 analysis-cards 区域替换为：

```xml
<!-- 运势解读卡片 -->
<view class="fortune-cards" wx:if="{{analysisCards && analysisCards.length > 0}}">
  <view class="fortune-section-title">八字解读</view>
  <fortune-card
    wx:for="{{analysisCards}}"
    wx:key="id"
    card="{{item}}"
  />
</view>
```

### Step 3.3: 提交

- [ ] **提交**

```bash
git add miniprogram/pages/bazi/
git commit -m "refactor: bazi page use fortune-card component"
```

---

## Task 4: 重构塔罗页面

**Files:**
- Modify: `miniprogram/pages/tarot/tarot.js`
- Modify: `miniprogram/pages/tarot/tarot.wxml`

### Step 4.1: 检查当前塔罗数据结构

- [ ] **读取 tarot.js 了解当前数据格式**

```bash
cat miniprogram/pages/tarot/tarot.js
```

### Step 4.2: 修改塔罗页面的卡片数据生成

假设塔罗页面有类似 parseToCards 的方法，修改为：

```javascript
// 在分析完成后，将结果转为卡片格式
const analysisCards = this.data.drawnCards.map((card, index) => {
  const positions = ['过去', '现在', '未来']
  const label = this.data.currentSpread === 3 ? positions[index] : '指引'

  return {
    id: `card-${index}`,
    title: `${card.name} - ${label}`,
    tags: [{ type: 'general', name: '综合' }],
    subtitle: card.isReversed ? '逆位' : '正位',
    status: { text: '详细解读', color: '#9C27B0' },
    content: markdown.parseMarkdown(card.interpretation || ''),
    maxLines: 3,
    footer: {
      icon: '🔮',
      text: '塔罗交流',
      count: Math.floor(Math.random() * 1000 + 200),
      action: '人正在讨论'
    },
    expanded: index === 0
  }
})

this.setData({ analysisCards })
```

### Step 4.3: 修改塔罗页面 WXML

- [ ] **修改 tarot.wxml**

```xml
<!-- 塔罗解读卡片 -->
<view class="fortune-cards" wx:if="{{analysisCards && analysisCards.length > 0}}">
  <view class="fortune-section-title">塔罗解读</view>
  <fortune-card
    wx:for="{{analysisCards}}"
    wx:key="id"
    card="{{item}}"
  />
</view>
```

### Step 4.4: 提交

- [ ] **提交**

```bash
git add miniprogram/pages/tarot/
git commit -m "refactor: tarot page use fortune-card component"
```

---

## Task 5: 重构解梦页面

**Files:**
- Modify: `miniprogram/pages/dream/dream.js`
- Modify: `miniprogram/pages/dream/dream.wxml`

### Step 5.1: 检查当前解梦数据结构

- [ ] **读取 dream.js**

### Step 5.2: 修改解梦页面的卡片数据生成

```javascript
const analysisCards = [
  {
    id: 'meaning',
    title: '梦境含义',
    tags: [{ type: 'general', name: '综合' }, { type: 'emotion', name: '情绪' }],
    subtitle: '深层解析',
    status: { text: '立即查看', color: '#00BCD4' },
    content: parsedResult,
    maxLines: 3,
    footer: {
      icon: '🌙',
      text: '梦友交流',
      count: Math.floor(Math.random() * 1500 + 300),
      action: '人做过类似梦'
    },
    expanded: true
  }
]
```

### Step 5.3: 修改解梦页面 WXML

- [ ] **修改 dream.wxml**

```xml
<!-- 解梦结果卡片 -->
<view class="fortune-cards" wx:if="{{analysisCards && analysisCards.length > 0}}">
  <view class="fortune-section-title">解梦结果</view>
  <fortune-card
    wx:for="{{analysisCards}}"
    wx:key="id"
    card="{{item}}"
  />
</view>
```

### Step 5.4: 提交

- [ ] **提交**

```bash
git add miniprogram/pages/dream/
git commit -m "refactor: dream page use fortune-card component"
```

---

## Task 6: 重构梅花易数页面

**Files:**
- Modify: `miniprogram/pages/meihua/meihua.js`
- Modify: `miniprogram/pages/meihua/meihua.wxml`

### Step 6.1: 检查当前梅花页面结构

- [ ] **读取 meihua.js 和 meihua.wxml**

### Step 6.2: 修改梅花页面使用新组件

参考前面的模式，将分析结果转为卡片格式。

### Step 6.3: 提交

- [ ] **提交**

```bash
git add miniprogram/pages/meihua/
git commit -m "refactor: meihua page use fortune-card component"
```

---

## Task 7: 重构姓名分析页面

**Files:**
- Modify: `miniprogram/pages/name/name.js`
- Modify: `miniprogram/pages/name/name.wxml`

### Step 7.1: 检查当前姓名页面结构

- [ ] **读取 name.js 和 name.wxml**

### Step 7.2: 修改姓名页面使用新组件

### Step 7.3: 提交

- [ ] **提交**

```bash
git add miniprogram/pages/name/
git commit -m "refactor: name page use fortune-card component"
```

---

## Task 8: 重构起名页面

**Files:**
- Modify: `miniprogram/pages/naming/naming.js`
- Modify: `miniprogram/pages/naming/naming.wxml`

### Step 8.1: 检查当前起名页面结构

- [ ] **读取 naming.js 和 naming.wxml**

### Step 8.2: 修改起名页面使用新组件

### Step 8.3: 提交

- [ ] **提交**

```bash
git add miniprogram/pages/naming/
git commit -m "refactor: naming page use fortune-card component"
```

---

## Task 9: 添加卡片区域标题样式

**Files:**
- Modify: `miniprogram/styles/theme.wxss`

### Step 9.1: 添加 fortune-cards 容器样式

- [ ] **在 theme.wxss 中添加**

```css
/* 运势卡片区域 */
.fortune-cards {
  margin-top: 32rpx;
}

.fortune-section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--gold-primary);
  text-align: center;
  margin-bottom: 24rpx;
  letter-spacing: 4rpx;
}
```

### Step 9.2: 提交

- [ ] **提交**

```bash
git add miniprogram/styles/theme.wxss
git commit -m "style: add fortune-cards section styles"
```

---

## Task 10: 清理旧组件（可选）

**Files:**
- Delete: `miniprogram/components/analysis-card/` (如果确认不再使用)

### Step 10.1: 确认旧组件不再使用

- [ ] **检查是否还有页面使用 analysis-card**

```bash
grep -r "analysis-card" miniprogram/pages/ --include="*.wxml"
```

### Step 10.2: 删除旧组件

- [ ] **删除旧组件**

```bash
rm -rf miniprogram/components/analysis-card/
```

### Step 10.3: 提交

- [ ] **提交**

```bash
git add -A
git commit -m "chore: remove deprecated analysis-card component"
```

---

## 验证清单

实施完成后，验证以下内容：

- [ ] 八字页面显示新卡片样式
- [ ] 塔罗页面显示新卡片样式
- [ ] 解梦页面显示新卡片样式
- [ ] 梅花易数页面显示新卡片样式
- [ ] 姓名分析页面显示新卡片样式
- [ ] 起名页面显示新卡片样式
- [ ] 彩色标签胶囊正确显示
- [ ] 进度条装饰正常显示
- [ ] 内容超出时显示「...全文」
- [ ] 点击全文可展开完整内容
- [ ] 点击收起可恢复截断状态
- [ ] 各页面卡片数据正确
- [ ] 小程序编译无错误
- [ ] 真机预览样式正常
