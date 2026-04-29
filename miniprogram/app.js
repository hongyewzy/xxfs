// app.js
App({
  globalData: {
    // AI API 配置
    aiConfig: {
      apiUrl: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2/chat/completions',
      apiKey: '69537ef1543d38ba50df647b2735fdb4:YTIyOTMxYTk4NzBkMGUzZGZlZDNiNmUx',
      model: 'astron-code-latest'
    },
    // 用户信息
    userInfo: null,
    // 历史记录
    history: []
  },

  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'your-cloud-env-id', // 云开发环境 ID
        traceUser: true
      })
    }

    // 加载本地历史记录
    this.loadHistory()
  },

  // 加载历史记录
  loadHistory() {
    try {
      const history = wx.getStorageSync('divination_history')
      if (history) {
        this.globalData.history = JSON.parse(history)
      }
    } catch (e) {
      console.error('加载历史记录失败', e)
    }
  },

  // 保存历史记录
  saveHistory(record) {
    this.globalData.history.unshift(record)
    // 保留最近 100 条
    if (this.globalData.history.length > 100) {
      this.globalData.history = this.globalData.history.slice(0, 100)
    }
    try {
      wx.setStorageSync('divination_history', JSON.stringify(this.globalData.history))
    } catch (e) {
      console.error('保存历史记录失败', e)
    }
  },

  // 清空历史记录
  clearHistory() {
    this.globalData.history = []
    wx.removeStorageSync('divination_history')
  }
})
