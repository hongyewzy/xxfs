// pages/meihua/meihua.js
const meihua = require('../../utils/meihua')
const aiApi = require('../../utils/ai-api')
const markdown = require('../../utils/markdown')

Page({
  data: {
    mode: 'time', // time | number
    year: '',
    month: '',
    day: '',
    hour: '',
    number1: '',
    number2: '',
    loading: false,
    result: null,
    aiResult: '',
    aiParsedResult: '',
    analysisCards: []
  },

  onLoad() {
    const now = new Date()
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours()
    })
  },

  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode, result: null, aiResult: '' })
  },

  onYearInput(e) { this.setData({ year: parseInt(e.detail.value) || 0 }) },
  onMonthInput(e) { this.setData({ month: parseInt(e.detail.value) || 0 }) },
  onDayInput(e) { this.setData({ day: parseInt(e.detail.value) || 0 }) },
  onHourInput(e) { this.setData({ hour: parseInt(e.detail.value) || 0 }) },
  onNumber1Input(e) { this.setData({ number1: e.detail.value }) },
  onNumber2Input(e) { this.setData({ number2: e.detail.value }) },

  async divinate() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      let result
      if (this.data.mode === 'time') {
        result = meihua.timeGua(
          this.data.year,
          this.data.month,
          this.data.day,
          this.data.hour
        )
      } else {
        result = meihua.numberGua(
          parseInt(this.data.number1) || 0,
          this.data.number2 ? parseInt(this.data.number2) : undefined
        )
      }

      this.setData({ result })

      // AI 解读
      const prompt = this.buildPrompt(result)
      const aiResult = await aiApi.chat(prompt, 'meihua')
      const aiParsedResult = markdown.parseMarkdown(aiResult)
      this.setData({ aiResult, aiParsedResult })

      // 解析 AI 结果为卡片数据
      const analysisCards = this.parseToCards(aiResult)
      this.setData({ analysisCards })

      this.saveHistory(result, aiResult)

    } catch (err) {
      wx.showToast({ title: '起卦失败', icon: 'error' })
      console.error(err)
    } finally {
      this.setData({ loading: false })
    }
  },

  buildPrompt(result) {
    return `请解读以下卦象：
原卦：${result.originalGua.name}
变卦：${result.changedGua.name}
动爻：第${result.dongYao}爻

请分析此卦象的吉凶和发展趋势，给出建议。`
  },

  saveHistory(result, aiResult) {
    const app = getApp()
    app.saveHistory({
      type: 'meihua',
      title: `${result.originalGua.name} 变 ${result.changedGua.name}`,
      result: aiResult,
      data: result,
      time: Date.now()
    })
  },

  reset() {
    this.setData({ result: null, aiResult: '', analysisCards: [] })
  },

  parseToCards(aiResult) {
    const cards = []
    const cardConfigs = [
      { keyword: '卦象', icon: '☯', title: '卦象解读' },
      { keyword: '变化', icon: '🔄', title: '变化分析' },
      { keyword: '应对', icon: '🧭', title: '应对建议' }
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
  }
})
