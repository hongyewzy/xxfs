// pages/name/name.js
const nameWuge = require('../../utils/name-wuge')
const aiApi = require('../../utils/ai-api')
const markdown = require('../../utils/markdown')

Page({
  data: {
    name: '',
    loading: false,
    result: null,
    aiResult: '',
    aiParsedResult: '',
    wugeList: [],
    analysisCards: []
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  async analyze() {
    if (!this.data.name.trim()) return

    this.setData({ loading: true })

    try {
      const result = nameWuge.analyzeName(this.data.name)

      const wugeList = [
        { name: '天格', ...result.wuge.tianGe },
        { name: '人格', ...result.wuge.renGe },
        { name: '地格', ...result.wuge.diGe },
        { name: '外格', ...result.wuge.waiGe },
        { name: '总格', ...result.wuge.zongGe }
      ]

      this.setData({ result, wugeList })

      // AI 分析
      const prompt = `请分析姓名"${this.data.name}"的五格数理：
天格：${result.wuge.tianGe.num}（${result.wuge.tianGe.wuxing}）${result.wuge.tianGe.jixiong}
人格：${result.wuge.renGe.num}（${result.wuge.renGe.wuxing}）${result.wuge.renGe.jixiong}
地格：${result.wuge.diGe.num}（${result.wuge.diGe.wuxing}）${result.wuge.diGe.jixiong}
外格：${result.wuge.waiGe.num}（${result.wuge.waiGe.wuxing}）${result.wuge.waiGe.jixiong}
总格：${result.wuge.zongGe.num}（${result.wuge.zongGe.wuxing}）${result.wuge.zongGe.jixiong}
三才配置：${result.sancai.config}（${result.sancai.jixiong}）
综合评分：${result.score}分
请给出姓名分析和改进建议。`

      const aiResult = await aiApi.chat(prompt, 'name')
      const aiParsedResult = markdown.parseMarkdown(aiResult)
      this.setData({ aiResult, aiParsedResult })

      // 解析 AI 结果为卡片数据
      const analysisCards = this.parseToCards(aiResult)
      this.setData({ analysisCards })

      const app = getApp()
      app.saveHistory({
        type: 'name',
        title: this.data.name,
        result: aiResult,
        data: result,
        time: Date.now()
      })
    } catch (err) {
      wx.showToast({ title: '分析失败', icon: 'error' })
    } finally {
      this.setData({ loading: false })
    }
  },

  parseToCards(aiResult) {
    const cards = []
    const cardConfigs = [
      { keywords: ['五格', '数理', '五格数理', '天格', '人格'], title: '五格分析', tags: [{ type: 'general', name: '综合' }] },
      { keywords: ['三才', '配置', '三才配置'], title: '三才配置', tags: [{ type: 'general', name: '综合' }] },
      { keywords: ['综合', '评分', '综合评价', '总评'], title: '综合评价', tags: [{ type: 'general', name: '综合' }] },
      { keywords: ['建议', '改进', '改进建议'], title: '改进建议', tags: [{ type: 'general', name: '综合' }] }
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
          subtitle: this.data.name,
          status: { text: '详细分析', color: '#2196F3' },
          content: contentHtml,
          maxLines: 3,
          footer: { icon: '🔤', text: '姓名交流', count: Math.floor(Math.random() * 1200 + 200), action: '人正在讨论' },
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
            subtitle: this.data.name,
            status: { text: '详细分析', color: '#2196F3' },
            content: markdown.parseMarkdown(body),
            maxLines: 3,
            footer: { icon: '🔤', text: '姓名交流', count: Math.floor(Math.random() * 1200 + 200), action: '人正在讨论' },
            expanded: index === 0
          })
        }
      })
    }

    if (cards.length === 0 && aiResult) {
      cards.push({
        id: 'default',
        title: '姓名分析',
        tags: [{ type: 'general', name: '综合' }],
        subtitle: this.data.name,
        status: { text: '详细分析', color: '#2196F3' },
        content: markdown.parseMarkdown(aiResult),
        maxLines: 3,
        footer: { icon: '🔤', text: '姓名交流', count: Math.floor(Math.random() * 1200 + 200), action: '人正在讨论' },
        expanded: true
      })
    }

    return cards
  }
})
