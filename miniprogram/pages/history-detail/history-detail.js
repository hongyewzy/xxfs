// pages/history-detail/history-detail.js
const markdown = require('../../utils/markdown.js')

Page({
  data: {
    item: null,
    parsedHtml: ''
  },

  onLoad(options) {
    if (options.data) {
      try {
        const item = JSON.parse(decodeURIComponent(options.data))
        const html = markdown.parseMarkdown(item.result)
        this.setData({ item, parsedHtml: html })
      } catch (e) {
        wx.navigateBack()
      }
    }
  },

  formatDate(timestamp) {
    const date = new Date(timestamp)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  },

  copyResult() {
    if (this.data.item) {
      wx.setClipboardData({
        data: this.data.item.result,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' })
        }
      })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
