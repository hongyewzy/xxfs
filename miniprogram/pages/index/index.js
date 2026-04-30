// pages/index/index.js
const fortune = require('../../utils/fortune');

Page({
  data: {
    fortuneType: 'zodiac',
    zodiacSigns: fortune.zodiacSigns,
    zodiacIndex: 0,
    years: [],
    yearIndex: 50,
    fortune: null
  },

  onLoad() {
    this.initYears();
    this.updateFortune();
  },

  initYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 1950; i <= currentYear; i++) {
      years.push(i);
    }
    this.setData({ years, yearIndex: years.length - 20 });
  },

  switchFortuneType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ fortuneType: type });
    this.updateFortune();
  },

  onZodiacChange(e) {
    this.setData({ zodiacIndex: e.detail.value });
    this.updateFortune();
  },

  onYearChange(e) {
    this.setData({ yearIndex: e.detail.value });
    this.updateFortune();
  },

  updateFortune() {
    const { fortuneType, zodiacSigns, zodiacIndex, years, yearIndex } = this.data;

    let data;
    if (fortuneType === 'zodiac') {
      data = zodiacSigns[zodiacIndex];
    } else {
      // 简化版：只用年份生成简单八字信息
      const year = years[yearIndex];
      data = { year };
    }

    const result = fortune.getDailyFortune(fortuneType, data);
    this.setData({ fortune: result });
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
