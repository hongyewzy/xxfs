// pages/naming/naming.js
const nameWuge = require('../../utils/name-wuge')
const aiApi = require('../../utils/ai-api')
const markdown = require('../../utils/markdown')

// 常用吉祥字及其寓意
const GOOD_CHARS = [
  { char: '明', meaning: '光明、聪明、明理' },
  { char: '华', meaning: '华丽、才华、繁荣' },
  { char: '文', meaning: '文雅、学识、才华' },
  { char: '建', meaning: '建设、成就、事业' },
  { char: '国', meaning: '国家、宏大、稳重' },
  { char: '海', meaning: '博大、胸怀、深邃' },
  { char: '强', meaning: '强壮、坚强、有力' },
  { char: '志', meaning: '志向、意志、决心' },
  { char: '伟', meaning: '伟大、宏伟、杰出' },
  { char: '军', meaning: '威武、果敢、刚毅' },
  { char: '平', meaning: '平和、安稳、公正' },
  { char: '东', meaning: '东方、朝气、希望' },
  { char: '辉', meaning: '光辉、辉煌、灿烂' },
  { char: '刚', meaning: '刚强、坚毅、正直' },
  { char: '永', meaning: '永恒、长久、坚定' },
  { char: '成', meaning: '成功、成就、圆满' },
  { char: '飞', meaning: '飞翔、进取、自由' },
  { char: '亮', meaning: '明亮、出众、光明' },
  { char: '俊', meaning: '俊秀、才智、杰出' },
  { char: '浩', meaning: '浩大、广阔、正气' },
  { char: '宇', meaning: '宇宙、气度、胸怀' },
  { char: '泽', meaning: '恩泽、润泽、仁慈' },
  { char: '豪', meaning: '豪迈、豪爽、大气' },
  { char: '毅', meaning: '毅力、坚毅、果敢' },
  { char: '鑫', meaning: '财富、兴盛、多金' },
  { char: '阳', meaning: '阳光、开朗、温暖' },
  { char: '勇', meaning: '勇敢、勇猛、无畏' },
  { char: '杰', meaning: '杰出、才华、优异' },
  { char: '峰', meaning: '高峰、顶峰、卓越' },
  { char: '坤', meaning: '大地、厚重、稳重' },
  { char: '婷', meaning: '婷婷、优美、端庄' },
  { char: '雪', meaning: '纯洁、高雅、清白' },
  { char: '芳', meaning: '芬芳、美好、德行' },
  { char: '敏', meaning: '敏捷、聪敏、机智' },
  { char: '静', meaning: '安静、宁静、沉稳' },
  { char: '丽', meaning: '美丽、秀丽、出众' },
  { char: '莉', meaning: '茉莉、清新、芳香' },
  { char: '琳', meaning: '美玉、珍贵、优雅' },
  { char: '萍', meaning: '平安、柔和、自在' },
  { char: '慧', meaning: '智慧、聪慧、明理' },
  { char: '颖', meaning: '聪颖、新颖、出众' },
  { char: '洁', meaning: '纯洁、清白、高洁' },
  { char: '思', meaning: '思考、思想、睿智' },
  { char: '嘉', meaning: '美好、嘉奖、优秀' },
  { char: '欣', meaning: '欣喜、快乐、欣欣向荣' },
  { char: '怡', meaning: '怡然、愉悦、舒适' },
  { char: '雅', meaning: '高雅、文雅、优雅' },
  { char: '梦', meaning: '梦想、美好、憧憬' },
  { char: '琪', meaning: '美玉、珍奇、宝贵' },
  { char: '佳', meaning: '美好、优秀、上佳' },
  { char: '涵', meaning: '涵养、包容、内涵' },
  { char: '萱', meaning: '萱草、忘忧、快乐' },
  { char: '蕊', meaning: '花蕊、芬芳、娇美' },
  { char: '薇', meaning: '紫薇、高雅、柔美' },
  { char: '馨', meaning: '温馨、芳香、美好' },
  { char: '然', meaning: '自然、安然、从容' },
  { char: '诗', meaning: '诗意、文雅、才情' },
  { char: '瑶', meaning: '美玉、珍贵、美好' },
  { char: '瑜', meaning: '美玉、品德、优秀' },
  { char: '妍', meaning: '美丽、妍丽、娇美' }
]

// 获取字的寓意
function getCharMeaning(char) {
  const found = GOOD_CHARS.find(c => c.char === char)
  return found ? found.meaning : '美好寓意'
}

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

  generate() {
    console.log('generate called, surname:', this.data.surname)

    if (!this.data.surname) {
      wx.showToast({ title: '请输入姓氏', icon: 'none' })
      return
    }

    this.setData({ loading: true, suggestions: [], selectedName: '' })

    const suggestions = []
    const maxAttempts = 100
    let attempts = 0

    // 生成候选名字
    while (suggestions.length < 5 && attempts < maxAttempts) {
      attempts++
      let nameChars = []
      if (this.data.nameCount === 1) {
        nameChars = [GOOD_CHARS[Math.floor(Math.random() * GOOD_CHARS.length)]]
      } else {
        nameChars = [
          GOOD_CHARS[Math.floor(Math.random() * GOOD_CHARS.length)],
          GOOD_CHARS[Math.floor(Math.random() * GOOD_CHARS.length)]
        ]
      }

      const name = this.data.surname + nameChars.map(c => c.char).join('')

      // 检查是否已存在
      if (suggestions.some(s => s.name === name)) continue

      try {
        const analysis = nameWuge.analyzeName(name)
        console.log('analyzing:', name, 'score:', analysis.score)

        // 降低分数门槛到60分
        if (analysis.score >= 60) {
          // 生成名字寓意介绍
          const nameMeanings = nameChars.map(c => `${c.char}：${c.meaning}`).join('；')
          const fullNameMeaning = nameChars.map(c => c.meaning.split('、')[0]).join('、')

          suggestions.push({
            name,
            score: analysis.score,
            desc: `${analysis.sancai.config} · ${analysis.sancai.jixiong}`,
            meaning: `${fullNameMeaning}。${nameMeanings}`
          })
        }
      } catch (err) {
        console.error('analyze error:', err)
      }
    }

    console.log('generated suggestions:', suggestions.length)

    // 按分数排序
    suggestions.sort((a, b) => b.score - a.score)

    this.setData({ loading: false })

    if (suggestions.length === 0) {
      wx.showToast({ title: '未找到合适名字，请换个姓氏试试', icon: 'none' })
    } else {
      this.setData({ suggestions: suggestions.slice(0, 5) })
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
        expanded: true
      })
    }

    return cards
  }
})
