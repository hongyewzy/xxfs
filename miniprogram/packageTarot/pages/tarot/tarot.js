// pages/tarot/tarot.js
const tarotData = require('/utils/tarot-data')
const aiApi = require('/utils/ai-api')
const markdown = require('/utils/markdown')

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

    let prompt = `问题：${this.data.question || '综合分析'}\n`
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
      title: this.data.question || '塔罗文化',
      result: this.data.aiResult,
      data: { cards: this.data.drawnCards, question: this.data.question },
      time: Date.now()
    })
  },

  parseToCards(aiResult) {
    const cards = []
    const cardConfigs = [
      { keywords: ['牌面', '牌意', '牌面解读', '正位', '逆位'], title: '牌面解读', tags: [{ type: 'general', name: '综合' }] },
      { keywords: ['综合', '总体', '综合建议', '整体'], title: '综合建议', tags: [{ type: 'general', name: '综合' }, { type: 'mind', name: '思维' }] },
      { keywords: ['行动', '建议', '指引', '行动指引'], title: '行动指引', tags: [{ type: 'career', name: '事业' }] }
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
          subtitle: this.data.drawnCards ? this.data.drawnCards.map(c => c.name).join('、') : '',
          status: { text: '详细解读', color: '#9C27B0' },
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
            subtitle: this.data.drawnCards ? this.data.drawnCards.map(c => c.name).join('、') : '',
            status: { text: '详细解读', color: '#9C27B0' },
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
        title: '文化解读',
        tags: [{ type: 'general', name: '综合' }],
        subtitle: this.data.drawnCards ? this.data.drawnCards.map(c => c.name).join('、') : '',
        status: { text: '详细解读', color: '#9C27B0' },
        content: markdown.parseMarkdown(aiResult),
        maxLines: 3,
        expanded: true
      })
    }

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
