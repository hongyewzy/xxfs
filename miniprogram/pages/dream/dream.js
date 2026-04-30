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

  parseToCards(aiResult) {
    const cards = []
    const cardConfigs = [
      { keywords: ['象征', '梦境象征', '象征意义'], title: '梦境象征', tags: [{ type: 'general', name: '综合' }, { type: 'emotion', name: '情绪' }] },
      { keywords: ['启示', '心理', '心理暗示', '潜在启示'], title: '潜在启示', tags: [{ type: 'general', name: '综合' }, { type: 'mind', name: '思维' }] },
      { keywords: ['建议', '行动', '行动建议'], title: '行动建议', tags: [{ type: 'career', name: '事业' }] }
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
          subtitle: this.data.dreamContent.slice(0, 20) + '...',
          status: { text: '立即查看', color: '#00BCD4' },
          content: contentHtml,
          maxLines: 3,
          footer: { icon: '🌙', text: '梦友交流', count: Math.floor(Math.random() * 1500 + 300), action: '人做过类似梦' },
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
            subtitle: this.data.dreamContent.slice(0, 20) + '...',
            status: { text: '立即查看', color: '#00BCD4' },
            content: markdown.parseMarkdown(body),
            maxLines: 3,
            footer: { icon: '🌙', text: '梦友交流', count: Math.floor(Math.random() * 1500 + 300), action: '人做过类似梦' },
            expanded: index === 0
          })
        }
      })
    }

    if (cards.length === 0 && aiResult) {
      cards.push({
        id: 'default',
        title: '梦境解析',
        tags: [{ type: 'general', name: '综合' }],
        subtitle: this.data.dreamContent.slice(0, 20) + '...',
        status: { text: '立即查看', color: '#00BCD4' },
        content: markdown.parseMarkdown(aiResult),
        maxLines: 3,
        footer: { icon: '🌙', text: '梦友交流', count: Math.floor(Math.random() * 1500 + 300), action: '人做过类似梦' },
        expanded: true
      })
    }

    return cards
  }
})
