# 玄学风水微信小程序

基于 AI 的风水玄学占卜小程序，中式古典风格 UI。

## 功能模块

| 功能 | 说明 |
|------|------|
| 八字命理 | 生辰八字、五行分析、AI 解读 |
| 农历查询 | 公农历互转、节气、生肖、星座 |
| 塔罗占卜 | 单张牌/三牌阵、AI 解读 |
| 周公解梦 | 梦境描述、AI 分析 |
| 姓名五格 | 五格数理、三才配置、评分 |
| 起名取名 | 根据姓氏推荐吉祥名 |
| 梅花易数 | 时间起卦/数字起卦、AI 解读 |
| 历史记录 | 占卜记录保存与查看 |

## 技术栈

- 前端：微信小程序原生开发
- 后端：小程序云开发（可选）
- AI：调用用户提供的 AI API（兼容 OpenAI 格式）

## 项目结构

```
miniprogram/
├── pages/           # 页面文件
│   ├── index/       # 首页
│   ├── bazi/        # 八字命理
│   ├── lunar/       # 农历查询
│   ├── tarot/       # 塔罗占卜
│   ├── dream/       # 周公解梦
│   ├── name/        # 姓名五格
│   ├── naming/      # 起名取名
│   ├── meihua/      # 梅花易数
│   └── history/     # 历史记录
├── utils/           # 工具函数
│   ├── lunar.js     # 农历算法
│   ├── bazi.js      # 八字算法
│   ├── wuxing.js    # 五行算法
│   ├── name-wuge.js # 姓名五格
│   ├── meihua.js    # 梅花易数
│   ├── tarot-data.js# 塔罗牌数据
│   └── ai-api.js    # AI API 封装
├── styles/
│   └── theme.wxss   # 全局主题样式
├── app.js
├── app.json
└── app.wxss
```

## 配置说明

### 1. 配置 AI API

编辑 `miniprogram/app.js`，修改 `aiConfig`：

```javascript
globalData: {
  aiConfig: {
    apiUrl: 'https://your-api-url/v1/chat/completions',
    apiKey: 'your-api-key',
    model: 'gpt-3.5-turbo'
  }
}
```

### 2. 配置小程序 AppID

编辑 `project.config.json`，修改 `appid`：

```json
{
  "appid": "your-wechat-appid"
}
```

### 3. （可选）配置云开发

如需使用云函数，编辑 `miniprogram/app.js`：

```javascript
wx.cloud.init({
  env: 'your-cloud-env-id'
})
```

## 运行项目

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目目录
3. 填入 AppID
4. 点击编译预览

## 算法来源

- 农历算法：移植自 [@tony801015/chinese-lunar](https://github.com/tony801015/chinese-lunar)
- 塔罗牌参考：[chatgpt-tarot-divination](https://github.com/dreamhunter2333/chatgpt-tarot-divination)

## 许可证

MIT License
