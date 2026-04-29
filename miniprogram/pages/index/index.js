// pages/index/index.js
Page({
  data: {},

  onLoad() {
    // 检查 AI 配置
    const app = getApp()
    if (!app.globalData.aiConfig.apiKey) {
      wx.showModal({
        title: '提示',
        content: '请先在 app.js 中配置 AI API 信息',
        showCancel: false
      })
    }
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  }
})
