// components/fortune-card/fortune-card.js
Component({
  properties: {
    // 卡片唯一标识
    id: {
      type: String,
      value: ''
    },
    // 主标题
    title: {
      type: String,
      value: ''
    },
    // 标签数组 [{type, name}]
    tags: {
      type: Array,
      value: []
    },
    // 副标题
    subtitle: {
      type: String,
      value: ''
    },
    // 状态 {text, color}
    status: {
      type: Object,
      value: null
    },
    // 正文内容（支持HTML）
    content: {
      type: String,
      value: ''
    },
    // 默认最大显示行数
    maxLines: {
      type: Number,
      value: 3
    },
    // 底部信息 {icon, text, count, action}
    footer: {
      type: Object,
      value: null
    },
    // 默认是否展开
    expanded: {
      type: Boolean,
      value: false
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
      this.setData({
        isExpanded: this.data.expanded
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
        id: this.properties.id,
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
      if (this.properties.footer && this.properties.footer.action) {
        this.triggerEvent('footerTap', {
          id: this.properties.id,
          action: this.properties.footer.action
        })
      }
    },

    // 获取标签样式
    getTagStyle(type) {
      const colors = this.data.tagColors[type] || this.data.tagColors.general
      return `background: ${colors.bg}; color: ${colors.text};`
    }
  }
})
