// pages/bazi/bazi.js
const bazi = require('../../utils/bazi')
const lunar = require('../../utils/lunar')
const aiApi = require('../../utils/ai-api')
const markdown = require('../../utils/markdown')

Page({
  data: {
    isLunar: false,
    solarDate: '',
    lunarYearIndex: 60,
    lunarMonthIndex: 0,
    lunarDayIndex: 0,
    hourIndex: 12,
    lunarYears: [],
    lunarMonths: [],
    lunarDays: [],
    hours: [],
    loading: false,
    result: null,
    aiResult: '',
    aiParsedResult: '',
    analysisCards: []
  },

  onLoad() {
    this.initPickers()
  },

  initPickers() {
    const now = new Date()
    const currentYear = now.getFullYear()

    // 生成年份列表
    const lunarYears = []
    for (let i = 1900; i <= 2050; i++) {
      lunarYears.push(i)
    }

    // 生成农历月
    const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '腊月']

    // 生成农历日
    const lunarDays = []
    for (let i = 1; i <= 30; i++) {
      lunarDays.push(lunar.getLunarDayName(i))
    }

    // 生成时辰
    const hours = ['子时(23:00-01:00)', '丑时(01:00-03:00)', '寅时(03:00-05:00)',
      '卯时(05:00-07:00)', '辰时(07:00-09:00)', '巳时(09:00-11:00)',
      '午时(11:00-13:00)', '未时(13:00-15:00)', '申时(15:00-17:00)',
      '酉时(17:00-19:00)', '戌时(19:00-21:00)', '亥时(21:00-23:00)']

    this.setData({
      lunarYears,
      lunarMonths,
      lunarDays,
      hours,
      lunarYearIndex: currentYear - 1900,
      solarDate: this.formatDate(now)
    })
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  switchCalendarType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ isLunar: type === 'lunar' })
  },

  onDateChange(e) {
    this.setData({ solarDate: e.detail.value })
  },

  onLunarYearChange(e) {
    this.setData({ lunarYearIndex: parseInt(e.detail.value) })
  },

  onLunarMonthChange(e) {
    this.setData({ lunarMonthIndex: parseInt(e.detail.value) })
  },

  onLunarDayChange(e) {
    this.setData({ lunarDayIndex: parseInt(e.detail.value) })
  },

  onHourChange(e) {
    this.setData({ hourIndex: parseInt(e.detail.value) })
  },

  async analyze() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      // 解析日期
      let year, month, day
      const hour = this.data.hourIndex

      if (this.data.isLunar) {
        // 农历转公历
        const lunarYear = this.data.lunarYears[this.data.lunarYearIndex]
        const lunarMonth = this.data.lunarMonthIndex + 1
        const lunarDay = this.data.lunarDayIndex + 1
        const solar = lunar.lunarToSolar(lunarYear, lunarMonth, lunarDay)
        year = solar.year
        month = solar.month
        day = solar.day
      } else {
        const parts = this.data.solarDate.split('-')
        year = parseInt(parts[0])
        month = parseInt(parts[1])
        day = parseInt(parts[2])
      }

      // 计算八字
      const result = bazi.getFourPillars(year, month, day, hour)

      this.setData({ result })

      // 调用 AI 分析
      const prompt = this.buildPrompt(result)
      const aiResult = await aiApi.chat(prompt, 'bazi')
      const aiParsedResult = markdown.parseMarkdown(aiResult)

      this.setData({ aiResult, aiParsedResult })

      // 解析 AI 结果为卡片数据
      const analysisCards = this.parseToCards(aiResult)
      this.setData({ analysisCards })

      // 保存历史
      this.saveHistory(result, aiResult)

    } catch (err) {
      wx.showToast({ title: err.message || '分析失败', icon: 'error', duration: 3000 })
      console.error('八字解析错误:', err)
      wx.showModal({
        title: '解析失败',
        content: err.message || '未知错误',
        showCancel: false
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  buildPrompt(result) {
    return `请根据以下八字信息进行详细解读：
年柱：${result.yearGan}${result.yearZhi}
月柱：${result.monthGan}${result.monthZhi}
日柱：${result.dayGan}${result.dayZhi}
时柱：${result.hourGan}${result.hourZhi}
五行配置：${result.wuxingList.map(w => `${w.name}${w.count}`).join('、')}
请从性格特质、事业运势、感情婚姻、健康注意等方面进行分析，给出专业的命理解读。`
  },

  saveHistory(result, aiResult) {
    const app = getApp()
    app.saveHistory({
      type: 'bazi',
      title: `${result.yearGan}${result.yearZhi}年 ${result.monthGan}${result.monthZhi}月 ${result.dayGan}${result.dayZhi}日 ${result.hourGan}${result.hourZhi}时`,
      result: aiResult,
      data: result,
      time: Date.now()
    })
  },

  copyResult() {
    if (!this.data.aiResult) return
    wx.setClipboardData({
      data: this.data.aiResult,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  },

  parseToCards(aiResult) {
    const cards = []
    const cardConfigs = [
      { keywords: ['五行', '命格', '格局', '五行配置'], title: '五行命格', tags: [{ type: 'general', name: '综合' }] },
      { keywords: ['性格', '个性', '特质', '性格特点'], title: '性格特点', tags: [{ type: 'mind', name: '性格' }, { type: 'emotion', name: '情绪' }] },
      { keywords: ['事业', '工作', '财运', '财富', '事业运势'], title: '事业财运', tags: [{ type: 'career', name: '事业' }, { type: 'wealth', name: '财运' }] },
      { keywords: ['感情', '婚姻', '爱情', '姻缘', '感情婚姻'], title: '感情婚姻', tags: [{ type: 'love', name: '爱情' }, { type: 'social', name: '人际' }] },
      { keywords: ['健康', '身体', '疾病', '健康注意'], title: '健康运势', tags: [{ type: 'health', name: '健康' }] },
      { keywords: ['贵人', '人际', '贵人运', '人际关系'], title: '贵人运势', tags: [{ type: 'social', name: '人际' }] },
      { keywords: ['建议', '指引', '注意', '人生建议', '综合建议'], title: '人生建议', tags: [{ type: 'general', name: '综合' }] }
    ]

    // 尝试按 ## 分割，如果没有则整体作为一个 section
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

        // 优先匹配标题包含任一关键字的 section
        for (const keyword of config.keywords) {
          if (title.includes(keyword)) {
            matchedSection = section
            matchedIndex = i
            break
          }
        }
        if (matchedSection) break
      }

      // 如果标题没匹配到，再在正文里找
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
          subtitle: '',
          content: contentHtml,
          maxLines: 3,
          expanded: index === 0
        })
      }
    })

    // 智能兜底：如果匹配到的卡片少于 2 个，按 ## 标题自动拆分
    if (cards.length < 2 && sections.length > 1) {
      cards.length = 0 // 清空原有卡片，重新按段落拆分
      sections.forEach((section, index) => {
        const lines = section.split('\n')
        const title = lines[0].trim().replace(/^#+\s*/, '')
        let body = lines.slice(1).join('\n').trim()
        body = body.replace(/^#{1,6}\s*.+$/gm, '').trim()
        body = body.replace(/\n{3,}/g, '\n\n')

        if (body) {
          const contentHtml = markdown.parseMarkdown(body)
          cards.push({
            id: `section-${index}`,
            title: title || `解读 ${index + 1}`,
            tags: [{ type: 'general', name: '综合' }],
            subtitle: '',
            content: contentHtml,
            maxLines: 3,
            expanded: index === 0
          })
        }
      })
    }

    // 最终兜底：如果仍然没有卡片，将全部内容作为一个卡片
    if (cards.length === 0 && aiResult) {
      cards.push({
        id: 'default',
        title: '八字解读',
        tags: [{ type: 'general', name: '综合' }],
        subtitle: '',
        content: markdown.parseMarkdown(aiResult),
        maxLines: 3,
        expanded: true
      })
    }

    return cards
  }
})
