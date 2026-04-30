// components/fortune-card/fortune-card.js
Component({
  properties: {
    // 卡片数据对象
    card: {
      type: Object,
      value: {}
    },
    // 是否显示底部
    showFooter: {
      type: Boolean,
      value: true
    },
    // 是否显示进度条
    showProgress: {
      type: Boolean,
      value: true
    }
  },

  data: {
    isExpanded: false,
    tagColors: {
      career: { bg: '#E3F2FD', text: '#2196F3' },
      social: { bg: '#E8F5E9', text: '#4CAF50' },
      love: { bg: '#FCE4EC', text: '#E91E63' },
      mind: { bg: '#F3E5F5', text: '#9C27B0' },
      emotion: { bg: '#E0F7FA', text: '#00BCD4' },
      wealth: { bg: '#FFF8E1', text: '#FFA000' },
      health: { bg: '#E8EAF6', text: '#3F51B5' },
      general: { bg: '#FFF3E0', text: '#F57C00' },
      study: { bg: '#E0F2F1', text: '#009688' },
      family: { bg: '#FCE4EC', text: '#E91E63' }
    }
  },

  lifetimes: {
    attached() {
      const card = this.properties.card || {}
      this.setData({
        isExpanded: card.expanded || false
      })
    }
  },

  methods: {
    // 切换展开/收起
    toggleExpand() {
      this.setData({
        isExpanded: !this.data.isExpanded
      })
      this.triggerEvent('expandChange', {
        id: this.properties.card.id,
        expanded: this.data.isExpanded
      })
    },

    // 点击标签
    onTagTap(e) {
      const { type, name } = e.currentTarget.dataset
      this.triggerEvent('tagTap', { type, name })
    },

    // 点击底部操作
    onFooterTap() {
      const card = this.properties.card || {}
      if (card.footer) {
        this.triggerEvent('footerTap', {
          id: card.id,
          action: card.footer.action
        })
      }
    }
  }
})
