// miniprogram/utils/fortune.js

// 星座列表
const zodiacSigns = [
  '白羊座', '金牛座', '双子座', '巨蟹座',
  '狮子座', '处女座', '天秤座', '天蝎座',
  '射手座', '摩羯座', '水瓶座', '双鱼座'
];

// 运势等级
const fortuneLevels = ['大吉', '中吉', '小吉', '平', '小凶', '大凶'];

// 幸运色
const luckyColors = ['红色', '橙色', '黄色', '绿色', '蓝色', '紫色', '白色', '黑色'];

// 幸运数字
const luckyNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// 宜
const goodActions = ['祭祀', '祈福', '求嗣', '开光', '塑绘', '出行', '移徙', '入宅', '安门', '安床', '求医', '治病'];

// 忌
const badActions = ['动土', '破土', '安葬', '开市', '交易', '立券', '栽种', '伐木', '纳畜', '牧养', '祈雨', '潜水'];

// 五行对应的运势描述
const wuxingFortunes = {
  '金': { level: '中吉', keywords: ['财运上升', '贵人相助', '事业稳定'] },
  '木': { level: '小吉', keywords: ['创意丰富', '人际和谐', '健康平稳'] },
  '水': { level: '大吉', keywords: ['智慧大开', '贵人运佳', '诸事顺遂'] },
  '火': { level: '平', keywords: ['热情高涨', '注意人际', '适合理财'] },
  '土': { level: '小吉', keywords: ['脚踏实地', '财运平稳', '健康如意'] }
};

// 固定运势点评
const fortuneComments = [
  '今天适合静心思考，可能会收获意想不到的惊喜。',
  '保持积极心态，好运自然会降临到你身边。',
  '今天是一个幸运的日子，把握机会会有好的收获。',
  '注意调整节奏，稳步前进会遇到更好的机遇。',
  '发挥你的特长，今天会有意想不到的收获。'
];

/**
 * 生成每日运势
 * @param {string} type - 'zodiac' 或 'bazi'
 * @param {string|object} data - 星座名称或八字数据
 */
function getDailyFortune(type, data) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;

  // 根据日期生成伪随机但固定的结果
  const seed = parseInt(dateStr) + (type === 'zodiac' ? zodiacSigns.indexOf(data) : 0);

  const levelIndex = seed % fortuneLevels.length;
  const colorIndex = (seed * 2) % luckyColors.length;
  const numberIndex = (seed * 3) % luckyNumbers.length;
  const goodIndex = seed % goodActions.length;
  const badIndex = (seed * 5) % badActions.length;
  const commentIndex = seed % fortuneComments.length;

  let level, keywords, comment;

  if (type === 'bazi' && data && data.dayGan) {
    // 八字日干对应的五行
    const dayGan = data.dayGan;
    const wuxingMap = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
    const wuxing = wuxingMap[dayGan] || '土';
    const wuxingInfo = wuxingFortunes[wuxing];
    level = wuxingInfo.level;
    keywords = wuxingInfo.keywords;
  } else {
    level = fortuneLevels[levelIndex];
    keywords = [];
  }

  return {
    level,
    levelIndex: levelIndex,
    luckyColor: luckyColors[colorIndex],
    luckyNumber: luckyNumbers[numberIndex],
    good: goodActions[goodIndex],
    bad: badActions[badIndex],
    comment: fortuneComments[commentIndex],
    keywords
  };
}

/**
 * 获取八字日干对应的五行
 */
function getBaziWuxing(dayGan) {
  const wuxingMap = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  return wuxingMap[dayGan] || '土';
}

module.exports = {
  zodiacSigns,
  getDailyFortune,
  getBaziWuxing
};
