// pages/naming/naming.js
const nameWuge = require('../../utils/name-wuge')
const aiApi = require('../../utils/ai-api')
const markdown = require('../../utils/markdown')

// 常用吉祥字
const GOOD_CHARS = [
  '明', '华', '文', '建', '国', '海', '强', '志', '伟', '军',
  '平', '东', '辉', '刚', '永', '成', '飞', '亮', '俊', '浩',
  '宇', '泽', '豪', '毅', '鑫', '阳', '勇', '杰', '峰', '坤',
  '婷', '雪', '芳', '敏', '静', '丽', '莉', '琳', '萍', '慧',
  '颖', '洁', '思', '嘉', '欣', '怡', '雅', '梦', '琪', '佳',
  '涵', '萱', '蕊', '薇', '馨', '然', '诗', '瑶', '瑜', '妍'
]

Page({
  data: {
    surname: '',
    nameCount: 2,
    loading: false,
    suggestions: [],
    selectedName: '',
    analysis: '',
    parsedAnalysis: '',
    analysisCards: []
  },

  onSurnameInput(e) {
    this.setData({ surname: e.detail.value, suggestions: [], selectedName: '' })
  },

  selectCount(e) {
    this.setData({ nameCount: parseInt(e.currentTarget.dataset.count), suggestions: [], selectedName: '' })
  },

  async generate() {
    if (!this.data.surname) return

    this.setData({ loading: true, suggestions: [], selectedName: '' })

    try {
      const suggestions = []

      // 生成候选名字
      for (let i = 0; i < 10; i++) {
        let name
        if (this.data.nameCount === 1) {
          const char = GOOD_CHARS[Math.floor(Math.random() * GOOD_CHARS.length)]
          name = this.data.surname + char
        } else {
          const char1 = GOOD_CHARS[Math.floor(Math.random() * GOOD_CHARS.length)]
          const char2 = GOOD_CHARS[Math.floor(Math.random() * GOOD_CHARS.length)]
          name = this.data.surname + char1 + char2
        }

        const analysis = nameWuge.analyzeName(name)
        if (analysis.score >= 70) {
          suggestions.push({
            name,
            score: analysis.score,
            desc: `${analysis.sancai.config} · ${analysis.sancai.jixiong}`
          })
        }
      }

      // 按分数排序
      suggestions.sort((a, b) => b.score - a.score)
      this.setData({ suggestions: suggestions.slice(0, 5) })

    } catch (err) {
      wx.showToast({ title: '生成失败', icon: 'error' })
    } finally {
      this.setData({ loading: false })
    }
  },

  async selectName(e) {
    const name = e.currentTarget.dataset.name
    this.setData({ selectedName: name, analysis: '分析中...', parsedAnalysis: '', analysisCards: [] })

    try {
      const analysis = nameWuge.analyzeName(name)
      const prompt = `请分析名字"${name}"的寓意和五格：
天格：${analysis.wuge.tianGe.num} 人格：${analysis.wuge.renGe.num} 地格：${analysis.wuge.diGe.num}
总格：${analysis.wuge.zongGe.num} 三才：${analysis.sancai.config}
请从寓意、音韵、字形等方面分析这个名字。`

      const result = await aiApi.chat(prompt, 'naming')
      const parsedResult = markdown.parseMarkdown(result)
      this.setData({ analysis: result, parsedAnalysis: parsedResult })

      // 解析 AI 结果为卡片数据
      const analysisCards = this.parseToCards(result)
      this.setData({ analysisCards })

      const app = getApp()
      app.saveHistory({
        type: 'naming',
        title: name,
        result,
        time: Date.now()
      })
    } catch (err) {
      this.setData({ analysis: '分析失败，请重试' })
    }
  },

  parseToCards(aiResult) {
    const cards = []
    const cardConfigs = [
      { keywords: ['八字', '五行', '八字分析', '命理'], title: '八字分析', tags: [{ type: 'general', name: '综合' }] },
      { keywords: ['推荐', '名字', '推荐名字', '候选'], title: '推荐名字', tags: [{ type: 'general', name: '综合' }] },
      { keywords: ['解析', '含义', '名字解析', '寓意'], title: '名字解析', tags: [{ type: 'general', name: '综合' }] }
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
          subtitle: this.data.selectedName,
          status: { text: '名字分析', color: '#4CAF50' },
          content: contentHtml,
          maxLines: 3,
          footer: { icon: '💡', text: '起名交流', count: Math.floor(Math.random() * 1500 + 300), action: '人正在讨论' },
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
            subtitle: this.data.selectedName,
            status: { text: '名字分析', color: '#4CAF50' },
            content: markdown.parseMarkdown(body),
            maxLines: 3,
            footer: { icon: '💡', text: '起名交流', count: Math.floor(Math.random() * 1500 + 300), action: '人正在讨论' },
            expanded: index === 0
          })
        }
      })
    }

    if (cards.length === 0 && aiResult) {
      cards.push({
        id: 'default',
        title: '名字分析',
        tags: [{ type: 'general', name: '综合' }],
        subtitle: this.data.selectedName,
        status: { text: '名字分析', color: '#4CAF50' },
        content: markdown.parseMarkdown(aiResult),
        maxLines: 3,
        footer: { icon: '💡', text: '起名交流', count: Math.floor(Math.random() * 1500 + 300), action: '人正在讨论' },
        expanded: true
      })
    }

    return cards
  }
})
