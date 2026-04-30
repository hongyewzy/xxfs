# 分析卡片排版优化实现计划

> **For agentic workers:** 建议使用 superpowers:subagent-driven-development 技能来执行此计划任务。步骤使用 checkbox (`- [ ]`) 语法追踪。

**目标：** 优化 analysis-card 折叠卡片的排版，采用现代装饰边框风格，提升分析文字的可读性和视觉层次。

**架构改进：**
- 卡片整体：增加圆角、顶部金色渐变装饰条、淡金色阴影
- 卡片头部：金色渐变圆形图标 + 箭头旋转动画
- 卡片内容：优化段落间距、标题层级、列表样式

**涉及文件：**
- `miniprogram/styles/theme.wxss` - 主要样式定义
- `miniprogram/components/analysis-card/analysis-card.wxml` - 卡片结构
- `miniprogram/components/analysis-card/analysis-card.wxss` - 卡片样式

---

### Task 1: 优化卡片整体样式

**Files:**
- Modify: `miniprogram/styles/theme.wxss:538-600`

- [ ] **Step 1: 更新 analysis-card 整体样式**

将现有 `.analysis-card` 样式替换为：

```css
/* 折叠卡片容器 - 装饰边框型 */
.analysis-card {
  background: #ffffff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(184, 150, 46, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 顶部金色渐变装饰条 */
.analysis-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, var(--gold-dark) 0%, var(--gold-primary) 50%, var(--gold-light) 100%);
}

/* 卡片头部（可点击） */
.analysis-card .card-header {
  display: flex;
  align-items: center;
  padding: 32rpx 30rpx;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

.analysis-card .card-header:active {
  background: rgba(184, 150, 46, 0.05);
}
```

- [ ] **Step 2: 验证样式语法**

检查 CSS 语法是否正确，确保没有遗漏的括号或语法错误。

---

### Task 2: 优化卡片头部样式

**Files:**
- Modify: `miniprogram/styles/theme.wxss:600-650`

- [ ] **Step 1: 添加卡片图标样式**

在 theme.wxss 中添加 `.card-icon` 样式：

```css
/* 卡片图标 */
.analysis-card .card-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-light) 100%);
  border-radius: 14rpx;
  font-size: 24rpx;
  color: #fff;
  margin-right: 20rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(184, 150, 46, 0.3);
}
```

- [ ] **Step 2: 更新卡片标题样式**

```css
/* 卡片标题 */
.analysis-card .card-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1rpx;
}

/* 展开/收起箭头 */
.analysis-card .card-arrow {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold-primary);
  font-size: 22rpx;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.analysis-card .card-arrow.expanded {
  transform: rotate(180deg);
}
```

- [ ] **Step 3: 更新卡片摘要样式**

```css
/* 摘要文字（折叠时显示） */
.analysis-card .card-summary {
  font-size: 26rpx;
  color: var(--text-muted);
  line-height: 1.7;
  padding: 0 30rpx 28rpx;
  background: #fff;
  border-bottom: 1rpx solid rgba(184, 150, 46, 0.1);
}

.analysis-card .card-summary.hidden {
  display: none;
}
```

---

### Task 3: 优化卡片内容排版

**Files:**
- Modify: `miniprogram/styles/theme.wxss:650-700`

- [ ] **Step 1: 更新卡片内容区域样式**

```css
/* 卡片内容区域 */
.analysis-card .card-content {
  padding: 32rpx;
  background: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 卡片内容隐藏 */
.analysis-card .card-content.hidden {
  display: none;
}
```

- [ ] **Step 2: 优化内容内部排版样式**

在 theme.wxss 中更新 `.card-body` 相关样式：

```css
/* 卡片内文字内容 - 分析文字排版优化 */
.analysis-card .card-body {
  color: var(--text-primary);
  font-size: 28rpx;
  line-height: 1.95;
}

.analysis-card .card-body rich-text {
  display: block;
}

/* 标题层级 */
.analysis-card .card-body h1 {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-primary);
  margin: 36rpx 0 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid rgba(184, 150, 46, 0.2);
  letter-spacing: 2rpx;
}

.analysis-card .card-body h1:first-child {
  margin-top: 0;
}

.analysis-card .card-body h2 {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin: 32rpx 0 20rpx;
  padding-left: 20rpx;
  border-left: 4rpx solid var(--gold-primary);
}

.analysis-card .card-body h3 {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--gold-primary);
  margin: 28rpx 0 16rpx;
}

/* 段落 */
.analysis-card .card-body p {
  margin: 0;
  line-height: 1.95;
  color: var(--text-secondary);
  padding: 8rpx 0;
  text-align: justify;
}

/* 首段引导文字 */
.analysis-card .card-body > rich-text:first-of-type p:first-child {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 2;
}

/* 加粗 */
.analysis-card .card-body strong {
  font-weight: 600;
  color: var(--gold-dark);
}

/* 列表优化 */
.analysis-card .card-body ol,
.analysis-card .card-body ul {
  margin: 20rpx 0;
  padding-left: 36rpx;
}

.analysis-card .card-body ol li,
.analysis-card .card-body ul li {
  margin: 14rpx 0;
  color: var(--text-secondary);
  line-height: 1.85;
  position: relative;
}

/* 列表项装饰圆点 */
.analysis-card .card-body ul li::before {
  content: '';
  position: absolute;
  left: -20rpx;
  top: 18rpx;
  width: 8rpx;
  height: 8rpx;
  background: var(--gold-primary);
  border-radius: 50%;
}

/* 分隔线 */
.analysis-card .card-body hr {
  border: none;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, rgba(184, 150, 46, 0.3), transparent);
  margin: 32rpx 0;
}
```

- [ ] **Step 3: 更新 analysis-card.wxss 引用全局样式**

确保 `miniprogram/components/analysis-card/analysis-card.wxss` 正确引用全局样式（当前已是空文件，应该可以正常工作）。

---

### Task 4: 更新卡片结构支持图标

**Files:**
- Modify: `miniprogram/components/analysis-card/analysis-card.wxml:1-13`

- [ ] **Step 1: 更新卡片头部结构**

```html
<!--components/analysis-card/analysis-card.wxml-->
<view class="analysis-card">
  <!-- 卡片头部 -->
  <view class="card-header {{isExpanded ? 'expanded' : ''}}" bindtap="toggleExpand">
    <view class="card-icon">{{title[0]}}</view>
    <text class="card-title">{{title}}</text>
    <view class="card-arrow {{isExpanded ? 'expanded' : ''}}">▼</view>
  </view>

  <!-- 摘要（折叠时显示） -->
  <view class="card-summary {{isExpanded ? 'hidden' : ''}}" wx:if="{{summary}}">
    {{summary}}
  </view>

  <!-- 卡片内容 -->
  <view class="card-content {{isExpanded ? '' : 'hidden'}}">
    <view class="card-body">
      <rich-text nodes="{{content}}"></rich-text>
    </view>
  </view>
</view>
```

- [ ] **Step 2: 更新组件支持 summary 属性**

修改 `miniprogram/components/analysis-card/analysis-card.js`:

```javascript
Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    content: {
      type: String,
      value: ''
    },
    summary: {
      type: String,
      value: ''
    },
    expanded: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isExpanded: false
  },

  lifetimes: {
    attached() {
      this.setData({
        isExpanded: this.data.expanded
      })
    }
  },

  methods: {
    toggleExpand() {
      this.setData({
        isExpanded: !this.data.isExpanded
      })
    }
  }
})
```

---

### Task 5: 验证与测试

**Files:**
- 检查各页面使用 analysis-card 的地方

- [ ] **Step 1: 检查 bazi 页面**

运行微信开发者工具，检查八字页面的分析卡片显示效果。

- [ ] **Step 2: 检查 tarot 页面**

运行微信开发者工具，检查塔罗页面的分析卡片显示效果。

- [ ] **Step 3: 检查其他页面**

检查 dream、name、meihua 等页面的卡片显示是否正常。

---

### Task 6: 提交代码

- [ ] **Step 1: 提交更改**

```bash
git add miniprogram/styles/theme.wxss miniprogram/components/analysis-card/analysis-card.wxml miniprogram/components/analysis-card/analysis-card.js
git commit -m "style: 优化分析卡片排版，采用现代装饰边框风格"
```

---

**计划完成。**

文件已保存至 `docs/superpowers/plans/2026-04-29-card-typography-optimize.md`

**两个执行选项：**

**1. Subagent-Driven (推荐)** - 每个任务由独立子代理执行，任务间有代码审查

**2. Inline Execution** - 在当前会话中顺序执行任务

选择哪种方式？
