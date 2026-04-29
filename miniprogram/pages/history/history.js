// pages/history/history.js
Page({
  data: {
    history: [],
    filterType: 'all'
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    this.loadHistory()
  },

  loadHistory() {
    const app = getApp()
    const history = (app.globalData.history || []).map(item => ({
      ...item,
      dateStr: this.formatDate(item.time)
    }))
    this.setData({ history })
  },

  filterByType(e) {
    this.setData({ filterType: e.currentTarget.dataset.type })
  },

  deleteItem(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.globalData.history.splice(index, 1)
          wx.setStorageSync('divination_history', JSON.stringify(app.globalData.history))
          this.loadHistory()
        }
      }
    })
  },

  clearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有记录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.clearHistory()
          this.loadHistory()
        }
      }
    })
  },

  viewDetail(e) {
    const item = e.currentTarget.dataset.item
    const itemStr = encodeURIComponent(JSON.stringify(item))
    wx.navigateTo({
      url: `/pages/history-detail/history-detail?data=${itemStr}`
    })
  },

  formatDate(timestamp) {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }
})
