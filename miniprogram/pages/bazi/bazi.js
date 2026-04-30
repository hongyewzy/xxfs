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
      wx.showToast({ title: '分析失败', icon: 'error' })
      console.error(err)
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
      { keyword: '五行', title: '五行分析', tags: [{ type: 'general', name: '综合' }] },
      { keyword: '性格', title: '性格特点', tags: [{ type: 'mind', name: '性格' }, { type: 'emotion', name: '情绪' }] },
      { keyword: '事业', title: '事业运势', tags: [{ type: 'career', name: '事业' }, { type: 'wealth', name: '财运' }] },
      { keyword: '感情', title: '感情婚姻', tags: [{ type: 'love', name: '爱情' }, { type: 'social', name: '人际' }] },
      { keyword: '健康', title: '健康注意', tags: [{ type: 'health', name: '健康' }] }
    ]

    const sections = aiResult.split(/^## /m).filter(s => s.trim())

    cardConfigs.forEach((config, index) => {
      let matchedSection = ''
      for (const section of sections) {
        const lines = section.split('\n')
        const title = lines[0].trim()
        const body = lines.slice(1).join('\n')
        if (title.includes(config.keyword) || body.includes(config.keyword)) {
          matchedSection = section
          break
        }
      }

      if (matchedSection) {
        let body = matchedSection.split('\n').slice(1).join('\n').trim()
        body = body.replace(/^#{1,6}\s*.+$/gm, '').trim()
        body = body.replace(/\n{3,}/g, '\n\n')
        const contentHtml = markdown.parseMarkdown(body)

        cards.push({
          id: config.keyword,
          title: config.title,
          tags: config.tags,
          subtitle: '',
          status: { text: '点击查看', color: '#B8962E' },
          content: contentHtml,
          maxLines: 3,
          footer: { icon: '💬', text: '同类交流', count: Math.floor(Math.random() * 2000 + 500), action: '人正在讨论' },
          expanded: index === 0
        })
      }
    })
    return cards
  }
})
