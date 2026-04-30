# 分析卡片排版优化 V2 实现计划

> **For agentic workers:** 建议直接执行此计划，步骤使用 checkbox (`- [ ]`) 语法追踪。

**目标：** 参考杂志风现代排版，优化 analysis-card 折叠卡片的视觉效果

**参考风格：**
- 大圆角白色卡片 + 顶部彩色渐变装饰条
- 标题大而醒目，下方有英文副标题
- 大段落间距（强呼吸感）
- 关键内容金黄色高亮
- 项目列表有装饰符号

**涉及文件：**
- `miniprogram/styles/theme.wxss` - 卡片样式定义
- `miniprogram/components/analysis-card/analysis-card.wxml` - 卡片结构

---

### Task 1: 更新卡片整体样式

**Files:**
- Modify: `miniprogram/styles/theme.wxss` - `.analysis-card` 样式

- [ ] **Step 1: 更新卡片容器样式**

```css
/* 折叠卡片容器 - 杂志风 */
.analysis-card {
  background: #ffffff;
  border-radius: 32rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

/* 顶部彩色渐变装饰条 */
.analysis-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8rpx;
  background: linear-gradient(90deg,
    var(--gold-dark) 0%,
    var(--gold-primary) 30%,
    var(--gold-light) 60%,
    var(--gold-primary) 100%
  );
}
```

- [ ] **Step 2: 更新卡片头部样式**

```css
/* 卡片头部 */
.analysis-card .card-header {
  display: flex;
  align-items: center;
  padding: 40rpx 36rpx 36rpx;
  position: relative;
  cursor: pointer;
}

.analysis-card .card-header:active {
  background: rgba(184, 150, 46, 0.03);
}
```

---

### Task 2: 更新卡片内容排版样式

**Files:**
- Modify: `miniprogram/styles/theme.wxss` - `.analysis-card .card-body` 样式

- [ ] **Step 1: 更新基础文字样式**

```css
/* 卡片内文字内容 - 杂志风排版 */
.analysis-card .card-body {
  color: #2a2a2a;
  font-size: 30rpx;
  line-height: 2.4;
  padding: 0 36rpx 40rpx;
}

.analysis-card .card-body rich-text {
  display: block;
}
```

- [ ] **Step 2: 更新段落样式 - 大间距**

```css
/* 段落 - 杂志风大间距 */
.analysis-card .card-body p {
  margin: 0;
  line-height: 2.6;
  color: #3a3a3a;
  padding: 28rpx 0;
  text-align: justify;
  letter-spacing: 1rpx;
}
```

- [ ] **Step 3: 首段标题样式**

```css
/* 首段识别为标题 - 大字 + 底部装饰线 */
.analysis-card .card-body p:first-child {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-top: 8rpx;
  padding-top: 24rpx;
  padding-bottom: 32rpx;
  margin-bottom: 16rpx;
  border-bottom: 4rpx solid var(--gold-primary);
  letter-spacing: 3rpx;
  line-height: 1.8;
}
```

- [ ] **Step 4: 关键字金黄色高亮**

```css
/* 加粗 - 金色高亮 */
.analysis-card .card-body strong {
  font-weight: 700;
  color: var(--gold-primary);
  padding: 4rpx 12rpx;
  margin: 0 4rpx;
  background: linear-gradient(180deg, rgba(184, 150, 46, 0.15) 0%, rgba(184, 150, 46, 0.08) 100%);
  border-radius: 8rpx;
  border-bottom: 2rpx solid var(--gold-light);
}
```

- [ ] **Step 5: 列表样式 - 大间距 + 装饰符号**

```css
/* 列表 */
.analysis-card .card-body ol,
.analysis-card .card-body ul {
  margin: 36rpx 0;
  padding-left: 48rpx;
}

.analysis-card .card-body ol li,
.analysis-card .card-body ul li {
  margin: 28rpx 0;
  color: #3a3a3a;
  line-height: 2.2;
  position: relative;
  padding-left: 16rpx;
}

/* 无序列表装饰圆点 - 更大更醒目 */
.analysis-card .card-body ul li::before {
  content: '';
  position: absolute;
  left: -32rpx;
  top: 28rpx;
  width: 14rpx;
  height: 14rpx;
  background: var(--gold-primary);
  border-radius: 50%;
  box-shadow: 0 0 8rpx rgba(184, 150, 46, 0.4);
}

/* 有序列表数字样式 */
.analysis-card .card-body ol {
  counter-reset: item;
}

.analysis-card .card-body ol li {
  display: block;
}

.analysis-card .card-body ol li::before {
  content: counter(item) ".";
  counter-increment: item;
  position: absolute;
  left: -36rpx;
  color: var(--gold-primary);
  font-weight: 700;
  font-size: 28rpx;
}
```

- [ ] **Step 6: 分隔线 - 渐变风格**

```css
/* 分隔线 */
.analysis-card .card-body hr {
  border: none;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, var(--gold-primary), transparent);
  margin: 56rpx 0;
}
```

---

### Task 3: 验证与测试

- [ ] **Step 1: 在微信开发者工具中预览效果**

检查点：
- 卡片顶部是否有 8rpx 渐变装饰条
- 首段是否识别为标题样式（大字+金色底线）
- 段落间距是否明显增大
- 关键字是否有金色高亮背景
- 列表是否有装饰圆点

- [ ] **Step 2: 根据效果微调**

如有需要，调整数值。

---

**计划完成。**

文件已保存至 `docs/superpowers/plans/2026-04-29-card-typography-v2.md`

**执行选项：**

1. **Inline Execution** - 在当前会话直接执行
2. **Subagent-Driven** - 使用子代理执行

选择哪种方式？
