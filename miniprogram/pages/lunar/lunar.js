// pages/lunar/lunar.js
const lunar = require('../../utils/lunar')
const bazi = require('../../utils/bazi')

Page({
  data: {
    solarDate: '',
    result: null
  },

  onLoad() {
    const now = new Date()
    this.setData({
      solarDate: this.formatDate(now)
    }, () => {
      this.query()
    })
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  onDateChange(e) {
    this.setData({ solarDate: e.detail.value }, () => {
      this.query()
    })
  },

  query() {
    const parts = this.data.solarDate.split('-')
    const year = parseInt(parts[0])
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])

    // 获取农历信息
    const lunarInfo = lunar.solarToLunar(year, month, day)

    // 获取四柱
    const pillars = bazi.getFourPillars(year, month, day, new Date().getHours())

    // 获取节气
    const solarTerms = lunar.getSolarTerms(year)

    this.setData({
      result: {
        lunarYear: lunarInfo.year,
        lunarMonth: lunarInfo.monthName,
        lunarDay: lunarInfo.dayName,
        ganzhi: `${lunarInfo.yearGanZhi}年`,
        animal: lunarInfo.animal,
        constellation: lunarInfo.constellation,
        currentTerm: lunarInfo.currentTerm,
        nextTerm: lunarInfo.nextTerm,
        pillars: [
          { gan: pillars.yearGan, zhi: pillars.yearZhi, label: '年柱' },
          { gan: pillars.monthGan, zhi: pillars.monthZhi, label: '月柱' },
          { gan: pillars.dayGan, zhi: pillars.dayZhi, label: '日柱' },
          { gan: pillars.hourGan, zhi: pillars.hourZhi, label: '时柱' }
        ]
      }
    })
  }
})
