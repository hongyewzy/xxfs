// pages/index/index.js
const fortune = require('../../utils/fortune');

Page({
  data: {
    fortuneType: 'zodiac',
    zodiacSigns: fortune.zodiacSigns,
    zodiacIndex: 0,
    shengxiaoList: fortune.shengxiaoList,
    shengxiaoIndex: 0,
    fortune: null
  },

  onLoad() {
    this.updateFortune();
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

  onShengxiaoChange(e) {
    this.setData({ shengxiaoIndex: e.detail.value });
    this.updateFortune();
  },

  updateFortune() {
    const { fortuneType, zodiacSigns, zodiacIndex, shengxiaoList, shengxiaoIndex } = this.data;

    let data;
    if (fortuneType === 'zodiac') {
      data = zodiacSigns[zodiacIndex];
    } else {
      data = shengxiaoList[shengxiaoIndex];
    }

    const result = fortune.getDailyFortune(fortuneType, data);
    this.setData({ fortune: result });
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
