// pages/tarot/tarot.js
const tarotData = require('../../utils/tarot-data')
const aiApi = require('../../utils/ai-api')
const markdown = require('../../utils/markdown')

Page({
  data: {
    question: '',
    currentSpread: 1,
    loading: false,
    drawn: false,
    flipped: false,
    drawnCards: [],
    aiResult: '',
    aiParsedResult: '',
    analysisCards: []
  },

  onQuestionInput(e) {
    this.setData({ question: e.detail.value })
  },

  selectSpread(e) {
    this.setData({ currentSpread: parseInt(e.currentTarget.dataset.spread) })
  },

  drawCards() {
    if (this.data.drawn) return

    const cards = tarotData.drawCards(this.data.currentSpread)
    const labels = ['过去', '现在', '未来']

    const drawnCards = cards.map((card, index) => ({
      ...card,
      label: this.data.currentSpread === 3 ? labels[index] : ''
    }))

    this.setData({ drawnCards, drawn: true, flipped: false })

    // 延迟翻转
    setTimeout(() => {
      this.setData({ flipped: true })
      this.analyze()
    }, 500)
  },

  flipCard() {
    this.setData({ flipped: !this.setData.flipped })
  },

  async analyze() {
    this.setData({ loading: true })

    try {
      const prompt = this.buildPrompt()
      const aiResult = await aiApi.chat(prompt, 'tarot')
      const aiParsedResult = markdown.parseMarkdown(aiResult)
      this.setData({ aiResult, aiParsedResult })
      // 解析 AI 结果为卡片数据
      const analysisCards = this.parseToCards(aiResult)
      this.setData({ analysisCards })
      this.saveHistory()
    } catch (err) {
      wx.showToast({ title: '分析失败', icon: 'error' })
    } finally {
      this.setData({ loading: false })
    }
  },

  buildPrompt() {
    const cardInfo = this.data.drawnCards.map(card => {
      return `${card.name}（${card.isReversed ? '逆位' : '正位'}）`
    }).join('、')

    let prompt = `问题：${this.data.question || '综合运势'}\n`
    prompt += `抽到的牌：${cardInfo}\n`

    if (this.data.currentSpread === 3) {
      prompt += '牌阵：三牌阵（过去/现在/未来）\n'
    }

    prompt += '请给出详细的牌意解读和建议。'
    return prompt
  },

  saveHistory() {
    const app = getApp()
    app.saveHistory({
      type: 'tarot',
      title: this.data.question || '塔罗占卜',
      result: this.data.aiResult,
      data: { cards: this.data.drawnCards, question: this.data.question },
      time: Date.now()
    })
  },

  parseToCards(aiResult) {
    const cards = []
    const cardConfigs = [
      { keyword: '牌面', icon: '🎴', title: '牌面解读' },
      { keyword: '综合', icon: '📖', title: '综合建议' },
      { keyword: '行动', icon: '⚡', title: '行动指引' }
    ]

    cardConfigs.forEach((config, index) => {
      let content = ''
      const sections = aiResult.split(/^## /m)
      sections.forEach(section => {
        if (section.includes(config.keyword)) {
          content += section + '\n'
        }
      })

      if (content) {
        const firstLine = content.split(/[。！？\n]/)[0]
        const summary = firstLine ? (firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine) : '点击查看详情'
        const contentHtml = markdown.parseMarkdown(content)

        cards.push({
          id: config.keyword,
          icon: config.icon,
          title: config.title,
          summary: summary,
          content: contentHtml,
          expanded: index === 0
        })
      }
    })

    return cards
  },

  reset() {
    this.setData({
      question: '',
      drawn: false,
      flipped: false,
      drawnCards: [],
      aiResult: '',
      aiParsedResult: '',
      analysisCards: []
    })
  }
})
