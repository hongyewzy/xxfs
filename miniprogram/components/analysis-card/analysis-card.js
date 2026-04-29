Component({
  properties: {
    // 卡片唯一标识
    cardId: {
      type: String,
      value: ''
    },
    // 图标emoji
    icon: {
      type: String,
      value: '✧'
    },
    // 标题
    title: {
      type: String,
      value: ''
    },
    // 摘要（折叠时显示）
    summary: {
      type: String,
      value: ''
    },
    // 完整内容（HTML格式）
    content: {
      type: String,
      value: ''
    },
    // 是否默认展开
    expanded: {
      type: Boolean,
      value: false
    },
    // 是否显示复制按钮
    showCopy: {
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
    // 切换展开/收起状态
    toggleExpand() {
      this.setData({
        isExpanded: !this.data.isExpanded
      })
    },

    // 复制内容
    onCopy() {
      const content = this.data.content.replace(/<[^>]+>/g, '')
      wx.setClipboardData({
        data: content,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' })
        }
      })
    }
  }
})
