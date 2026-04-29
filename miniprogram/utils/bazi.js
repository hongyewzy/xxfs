/**
 * 八字算法
 */

const { TIAN_GAN, DI_ZHI, getLeapMonth, getLunarMonthDays, solarToLunar } = require('./lunar')

// 六十甲子
const SIXTY_JIAZI = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
]

// 月支
const MONTH_ZHI = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

// 时辰对应地支
const HOUR_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 五行
const WUXING = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
}

// 藏干
const CANG_GAN = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '戊', '庚'],
  '午': ['丁', '己'],
  '未': ['己', '乙', '丁'],
  '申': ['庚', '壬', '癸'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
}

// 十神关系表
const TEN_GOD_TABLE = {
  '甲': ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'],
  '乙': ['劫财', '比肩', '伤官', '食神', '正财', '偏财', '正官', '七杀', '正印', '偏印'],
  '丙': ['偏印', '正印', '比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官'],
  '丁': ['正印', '偏印', '劫财', '比肩', '伤官', '食神', '正财', '偏财', '正官', '七杀'],
  '戊': ['七杀', '正官', '偏印', '正印', '比肩', '劫财', '食神', '伤官', '偏财', '正财'],
  '己': ['正官', '七杀', '正印', '偏印', '劫财', '比肩', '伤官', '食神', '正财', '偏财'],
  '庚': ['偏财', '正财', '七杀', '正官', '偏印', '正印', '比肩', '劫财', '食神', '伤官'],
  '辛': ['正财', '偏财', '正官', '七杀', '正印', '偏印', '劫财', '比肩', '食神', '伤官'],
  '壬': ['食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印', '比肩', '劫财'],
  '癸': ['伤官', '食神', '正财', '偏财', '正官', '七杀', '正印', '偏印', '劫财', '比肩']
}

// 纳音
const NAYIN = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
}

/**
 * 获取年柱
 */
function getYearPillar(year) {
  const ganIndex = (year - 4) % 10
  const zhiIndex = (year - 4) % 12
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex],
    ganzhi: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex]
  }
}

/**
 * 获取月柱
 */
function getMonthPillar(year, month, day) {
  // 年干决定月干
  const yearGan = getYearPillar(year).gan
  const yearGanIndex = TIAN_GAN.indexOf(yearGan)

  // 月支固定 (寅月开始)
  let monthZhiIndex = month + 1 // 寅月=1月
  if (monthZhiIndex >= 12) monthZhiIndex -= 12

  // 月干由年干决定 (五虎遁)
  const monthGanBase = (yearGanIndex % 5) * 2
  const monthGanIndex = (monthGanBase + month - 1) % 10

  return {
    gan: TIAN_GAN[monthGanIndex],
    zhi: MONTH_ZHI[monthZhiIndex],
    ganzhi: TIAN_GAN[monthGanIndex] + MONTH_ZHI[monthZhiIndex]
  }
}

/**
 * 获取日柱
 */
function getDayPillar(year, month, day) {
  // 基准日期: 1900年1月1日是甲戌日
  const baseDate = new Date(1900, 0, 1)
  const targetDate = new Date(year, month - 1, day)
  const diffDays = Math.floor((targetDate - baseDate) / 86400000)

  // 甲戌日在六十甲子中的索引
  const baseIndex = 10 // 甲戌
  const dayIndex = (baseIndex + diffDays) % 60

  const ganzhi = SIXTY_JIAZI[dayIndex]
  return {
    gan: ganzhi[0],
    zhi: ganzhi[1],
    ganzhi,
    index: dayIndex
  }
}

/**
 * 获取时柱
 */
function getHourPillar(dayGan, hour) {
  // 时支
  let hourZhiIndex = Math.floor((hour + 1) / 2) % 12
  if (hour === 23) hourZhiIndex = 0

  // 时干由日干决定 (五鼠遁)
  const dayGanIndex = TIAN_GAN.indexOf(dayGan)
  const hourGanBase = dayGanIndex % 5
  const hourGanIndex = (hourGanBase + hourZhiIndex) % 10

  return {
    gan: TIAN_GAN[hourGanIndex],
    zhi: HOUR_ZHI[hourZhiIndex],
    ganzhi: TIAN_GAN[hourGanIndex] + HOUR_ZHI[hourZhiIndex]
  }
}

/**
 * 获取四柱八字
 */
function getFourPillars(year, month, day, hour) {
  const yearPillar = getYearPillar(year)
  const monthPillar = getMonthPillar(year, month, day)
  const dayPillar = getDayPillar(year, month, day)
  const hourPillar = getHourPillar(dayPillar.gan, hour)

  // 五行统计
  const wuxingCount = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }

  const allGanZhi = [
    yearPillar.gan, yearPillar.zhi,
    monthPillar.gan, monthPillar.zhi,
    dayPillar.gan, dayPillar.zhi,
    hourPillar.gan, hourPillar.zhi
  ]

  allGanZhi.forEach(gz => {
    const wx = WUXING[gz]
    if (wx) wuxingCount[wx]++
  })

  const wuxingList = [
    { name: '金', count: wuxingCount['金'], type: 'jin' },
    { name: '木', count: wuxingCount['木'], type: 'mu' },
    { name: '水', count: wuxingCount['水'], type: 'shui' },
    { name: '火', count: wuxingCount['火'], type: 'huo' },
    { name: '土', count: wuxingCount['土'], type: 'tu' }
  ]

  return {
    yearGan: yearPillar.gan,
    yearZhi: yearPillar.zhi,
    yearGanZhi: yearPillar.ganzhi,
    monthGan: monthPillar.gan,
    monthZhi: monthPillar.zhi,
    monthGanZhi: monthPillar.ganzhi,
    dayGan: dayPillar.gan,
    dayZhi: dayPillar.zhi,
    dayGanZhi: dayPillar.ganzhi,
    hourGan: hourPillar.gan,
    hourZhi: hourPillar.zhi,
    hourGanZhi: hourPillar.ganzhi,
    wuxingCount,
    wuxingList
  }
}

/**
 * 获取十神
 */
function getTenGod(dayGan, targetGan) {
  const dayGanIndex = TIAN_GAN.indexOf(dayGan)
  const targetGanIndex = TIAN_GAN.indexOf(targetGan)
  const diff = (targetGanIndex - dayGanIndex + 10) % 10
  return TEN_GOD_TABLE[dayGan][diff]
}

/**
 * 获取藏干
 */
function getCangGan(zhi) {
  return CANG_GAN[zhi] || []
}

/**
 * 获取纳音
 */
function getNayin(ganzhi) {
  return NAYIN[ganzhi] || ''
}

/**
 * 获取胎元
 */
function getTaiYuan(monthGan, monthZhi) {
  const monthGanIndex = TIAN_GAN.indexOf(monthGan)
  const monthZhiIndex = DI_ZHI.indexOf(monthZhi)

  // 胎元 = 月干后一位 + 月支后三位
  const taiGanIndex = (monthGanIndex + 1) % 10
  const taiZhiIndex = (monthZhiIndex + 3) % 12

  return TIAN_GAN[taiGanIndex] + DI_ZHI[taiZhiIndex]
}

/**
 * 获取命宫
 */
function getMingGong(monthZhi, hourZhi) {
  const monthIndex = DI_ZHI.indexOf(monthZhi)
  const hourIndex = DI_ZHI.indexOf(hourZhi)

  // 命宫地支 = (14 - 月支序号 - 时支序号) % 12
  let mingIndex = (14 - monthIndex - hourIndex) % 12
  if (mingIndex < 0) mingIndex += 12

  return DI_ZHI[mingIndex]
}

/**
 * 获取身宫
 */
function getShenGong(monthZhi, hourZhi) {
  const monthIndex = DI_ZHI.indexOf(monthZhi)
  const hourIndex = DI_ZHI.indexOf(hourZhi)

  // 身宫地支 = (月支序号 + 时支序号 + 2) % 12
  const shenIndex = (monthIndex + hourIndex + 2) % 12

  return DI_ZHI[shenIndex]
}

/**
 * 获取空亡
 */
function getKongWang(dayGanZhi) {
  const index = SIXTY_JIAZI.indexOf(dayGanZhi)
  const remainder = index % 10

  const kongWangTable = [
    ['戌', '亥'], ['申', '酉'], ['午', '未'], ['辰', '巳'],
    ['寅', '卯'], ['子', '丑'], ['戌', '亥'], ['申', '酉'],
    ['午', '未'], ['辰', '巳']
  ]

  return kongWangTable[remainder] || []
}

module.exports = {
  SIXTY_JIAZI,
  WUXING,
  getYearPillar,
  getMonthPillar,
  getDayPillar,
  getHourPillar,
  getFourPillars,
  getTenGod,
  getCangGan,
  getNayin,
  getTaiYuan,
  getMingGong,
  getShenGong,
  getKongWong: getKongWang,
  TIAN_GAN,
  DI_ZHI
}
