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
      wx.showToast({ title: '分析失败', icon: 'error' })
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

请分析此卦象的含义和发展趋势，给出建议。`
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
      { keywords: ['卦象', '卦意', '卦象解读', '本卦', '变卦'], title: '卦象解读', tags: [{ type: 'general', name: '综合' }] },
      { keywords: ['变化', '变卦', '变化分析', '动爻'], title: '变化分析', tags: [{ type: 'mind', name: '思维' }] },
      { keywords: ['应对', '建议', '指引', '应对建议'], title: '应对建议', tags: [{ type: 'career', name: '事业' }] }
    ]

    const sections = aiResult.split(/^## /m).filter(s => s.trim())
    const usedSections = new Set()

    cardConfigs.forEach((config, index) => {
      let matchedSection = null
      let matchedIndex = -1

      for (let i = 0; i < sections.length; i++) {
        if (usedSections.has(i)) continue
        const section = sections[i]
        const lines = section.split('\n')
        const title = lines[0].trim()

        for (const keyword of config.keywords) {
          if (title.includes(keyword)) {
            matchedSection = section
            matchedIndex = i
            break
          }
        }
        if (matchedSection) break
      }

      if (!matchedSection) {
        for (let i = 0; i < sections.length; i++) {
          if (usedSections.has(i)) continue
          const section = sections[i]
          const lines = section.split('\n')
          const body = lines.slice(1).join('\n')

          for (const keyword of config.keywords) {
            if (body.includes(keyword)) {
              matchedSection = section
              matchedIndex = i
              break
            }
          }
          if (matchedSection) break
        }
      }

      if (matchedSection) {
        usedSections.add(matchedIndex)
        let body = matchedSection.split('\n').slice(1).join('\n').trim()
        body = body.replace(/^#{1,6}\s*.+$/gm, '').trim()
        body = body.replace(/\n{3,}/g, '\n\n')
        const contentHtml = markdown.parseMarkdown(body)

        cards.push({
          id: config.keywords[0],
          title: config.title,
          tags: config.tags,
          subtitle: this.data.result ? `${this.data.result.originalGua.name} → ${this.data.result.changedGua.name}` : '',
          status: { text: '文化解读', color: '#B8962E' },
          content: contentHtml,
          maxLines: 3,
          expanded: index === 0
        })
      }
    })

    // 智能兜底
    if (cards.length < 2 && sections.length > 1) {
      cards.length = 0
      sections.forEach((section, index) => {
        const lines = section.split('\n')
        const title = lines[0].trim().replace(/^#+\s*/, '')
        let body = lines.slice(1).join('\n').trim()
        body = body.replace(/^#{1,6}\s*.+$/gm, '').trim()
        body = body.replace(/\n{3,}/g, '\n\n')

        if (body) {
          cards.push({
            id: `section-${index}`,
            title: title || `解读 ${index + 1}`,
            tags: [{ type: 'general', name: '综合' }],
            subtitle: this.data.result ? `${this.data.result.originalGua.name} → ${this.data.result.changedGua.name}` : '',
            status: { text: '文化解读', color: '#B8962E' },
            content: markdown.parseMarkdown(body),
            maxLines: 3,
            expanded: index === 0
          })
        }
      })
    }

    if (cards.length === 0 && aiResult) {
      cards.push({
        id: 'default',
        title: '卦象解读',
        tags: [{ type: 'general', name: '综合' }],
        subtitle: this.data.result ? `${this.data.result.originalGua.name} → ${this.data.result.changedGua.name}` : '',
        status: { text: '文化解读', color: '#B8962E' },
        content: markdown.parseMarkdown(aiResult),
        maxLines: 3,
        expanded: true
      })
    }

    return cards
  }
})
