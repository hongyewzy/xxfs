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
      { keyword: '数理', icon: '📈', title: '数理分析' },
      { keyword: '三才', icon: '🔢', title: '三才配置' },
      { keyword: '建议', icon: '💡', title: '改名建议' }
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
