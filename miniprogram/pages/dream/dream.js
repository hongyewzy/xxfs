// pages/dream/dream.js
const aiApi = require('../../utils/ai-api')
const markdown = require('../../utils/markdown')

Page({
  data: {
    dreamContent: '',
    loading: false,
    result: '',
    parsedResult: '',
    analysisCards: []
  },

  onDreamInput(e) {
    this.setData({ dreamContent: e.detail.value })
  },

  async analyze() {
    if (!this.data.dreamContent.trim()) return

    this.setData({ loading: true })

    try {
      const prompt = `请解读以下梦境：\n${this.data.dreamContent}\n\n从心理学、传统文化角度分析梦境可能的含义，给出解读和建议。`
      const result = await aiApi.chat(prompt, 'dream')
      const parsedResult = markdown.parseMarkdown(result)

      this.setData({ result, parsedResult })

      // 解析为折叠卡片
      const analysisCards = this.parseToCards(result)
      this.setData({ analysisCards })

      const app = getApp()
      app.saveHistory({
        type: 'dream',
        title: this.data.dreamContent.slice(0, 20) + '...',
        result,
        time: Date.now()
      })
    } catch (err) {
      wx.showToast({ title: '解析失败', icon: 'error' })
    } finally {
      this.setData({ loading: false })
    }
  },

  parseToCards(result) {
    const cardConfigs = [
      { keyword: '象征', title: '梦境象征', tags: [{ type: 'general', name: '综合' }, { type: 'emotion', name: '情绪' }] },
      { keyword: '启示', title: '潜在启示', tags: [{ type: 'general', name: '综合' }, { type: 'mind', name: '思维' }] },
      { keyword: '建议', title: '行动建议', tags: [{ type: 'career', name: '事业' }] }
    ]

    const lines = result.split('\n')
    const cards = []
    let currentCard = null
    let currentContent = []

    for (const line of lines) {
      // 检查是否匹配某个卡片的关键词
      let matchedConfig = null
      for (const config of cardConfigs) {
        if (line.includes(config.keyword) && (line.includes('：') || line.includes(':') || line.includes('.'))) {
          matchedConfig = config
          break
        }
      }

      if (matchedConfig) {
        // 保存之前的卡片
        if (currentCard) {
          currentCard.content = markdown.parseMarkdown(currentContent.join('\n').trim())
          cards.push(currentCard)
        }
        // 开始新卡片
        currentCard = {
          id: matchedConfig.keyword,
          title: matchedConfig.title,
          tags: matchedConfig.tags,
          subtitle: this.data.dreamContent.slice(0, 20) + '...',
          status: { text: '立即查看', color: '#00BCD4' },
          content: '',
          maxLines: 3,
          footer: { icon: '🌙', text: '梦友交流', count: Math.floor(Math.random() * 1500 + 300), action: '人做过类似梦' },
          expanded: cards.length === 0
        }
        currentContent = []
      } else if (currentCard) {
        currentContent.push(line)
      }
    }

    // 保存最后一个卡片
    if (currentCard) {
      currentCard.content = markdown.parseMarkdown(currentContent.join('\n').trim())
      cards.push(currentCard)
    }

    // 如果没有匹配到任何卡片，将整个结果作为默认卡片
    if (cards.length === 0) {
      cards.push({
        id: 'default',
        title: '梦境解析',
        tags: [{ type: 'general', name: '综合' }],
        subtitle: this.data.dreamContent.slice(0, 20) + '...',
        status: { text: '立即查看', color: '#00BCD4' },
        content: markdown.parseMarkdown(result),
        maxLines: 3,
        footer: { icon: '🌙', text: '梦友交流', count: Math.floor(Math.random() * 1500 + 300), action: '人做过类似梦' },
        expanded: true
      })
    }

    return cards
  }
})
