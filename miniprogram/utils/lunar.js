/**
 * 农历算法 - 移植自 chinese-lunar
 */

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
// 生肖
const ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
// 农历月份
const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '腊月']
// 农历日期
const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
// 星座日期范围
const CONSTELLATIONS = [
  { name: '摩羯座', start: [1, 20], end: [2, 18] },
  { name: '水瓶座', start: [2, 19], end: [3, 20] },
  { name: '双鱼座', start: [3, 21], end: [4, 19] },
  { name: '白羊座', start: [3, 21], end: [4, 19] },
  { name: '金牛座', start: [4, 20], end: [5, 20] },
  { name: '双子座', start: [5, 21], end: [6, 21] },
  { name: '巨蟹座', start: [6, 22], end: [7, 22] },
  { name: '狮子座', start: [7, 23], end: [8, 22] },
  { name: '处女座', start: [8, 23], end: [9, 22] },
  { name: '天秤座', start: [9, 23], end: [10, 23] },
  { name: '天蝎座', start: [10, 24], end: [11, 22] },
  { name: '射手座', start: [11, 23], end: [12, 21] },
  { name: '摩羯座', start: [12, 22], end: [1, 19] }
]

// 节气数据
const SOLAR_TERMS = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至']

// 节气计算表 (1900-2100)
const SOLAR_TERM_INFO = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551,
  218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447,
  419210, 440795, 462224, 483532, 504758
]

// 农历数据 1900-2100
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
]

/**
 * 获取农历年的总天数
 */
function getLunarYearDays(year) {
  let sum = 348
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0
  }
  return sum + getLeapDays(year)
}

/**
 * 获取闰月天数
 */
function getLeapDays(year) {
  if (getLeapMonth(year)) {
    return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29
  }
  return 0
}

/**
 * 获取闰月月份 (0表示无闰月)
 */
function getLeapMonth(year) {
  return LUNAR_INFO[year - 1900] & 0xf
}

/**
 * 获取农历某月天数
 */
function getLunarMonthDays(year, month) {
  return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29
}

/**
 * 公历转农历
 */
function solarToLunar(year, month, day) {
  // 基准日期 1900年1月31日（农历1900年正月初一）
  const baseDate = new Date(1900, 0, 31)
  const targetDate = new Date(year, month - 1, day)
  let offset = Math.floor((targetDate - baseDate) / 86400000)

  // 计算农历年
  let lunarYear = 1900
  let yearDays = 0
  while (lunarYear < 2100 && offset > 0) {
    yearDays = getLunarYearDays(lunarYear)
    offset -= yearDays
    lunarYear++
  }
  if (offset < 0) {
    offset += yearDays
    lunarYear--
  }

  // 计算农历月
  let leapMonth = getLeapMonth(lunarYear)
  let isLeap = false
  let lunarMonth = 1
  let monthDays = 0

  while (lunarMonth < 13 && offset > 0) {
    if (leapMonth > 0 && lunarMonth === (leapMonth + 1) && !isLeap) {
      --lunarMonth
      isLeap = true
      monthDays = getLeapDays(lunarYear)
    } else {
      monthDays = getLunarMonthDays(lunarYear, lunarMonth)
    }

    if (isLeap && lunarMonth === (leapMonth + 1)) {
      isLeap = false
    }

    offset -= monthDays
    lunarMonth++
  }

  if (offset < 0) {
    offset += monthDays
    lunarMonth--
  }

  const lunarDay = offset + 1

  // 计算干支
  const yearGanZhi = getYearGanZhi(lunarYear)
  const animal = getAnimal(lunarYear)
  const constellation = getConstellation(month, day)

  return {
    year: lunarYear,
    month: lunarMonth,
    monthName: LUNAR_MONTHS[lunarMonth - 1] + (isLeap ? '(闰)' : ''),
    day: lunarDay,
    dayName: LUNAR_DAYS[lunarDay - 1],
    yearGanZhi,
    animal,
    constellation,
    isLeap,
    currentTerm: getCurrentSolarTerm(year, month, day),
    nextTerm: getNextSolarTerm(year, month, day)
  }
}

/**
 * 农历转公历
 */
function lunarToSolar(year, month, day, isLeap = false) {
  let offset = 0

  // 计算从1900年到目标年的总天数
  for (let i = 1900; i < year; i++) {
    offset += getLunarYearDays(i)
  }

  // 加上当年月份天数
  const leapMonth = getLeapMonth(year)
  let isLeapMonth = false

  for (let i = 1; i < month; i++) {
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeapMonth) {
      isLeapMonth = true
      offset += getLeapDays(year)
      i--
    } else {
      offset += getLunarMonthDays(year, i)
    }
  }

  // 处理闰月
  if (isLeap && leapMonth === month) {
    offset += getLunarMonthDays(year, month)
  }

  // 加上当月天数
  offset += day - 1

  // 基准日期 1900年1月31日
  const baseDate = new Date(1900, 0, 31)
  const result = new Date(baseDate.getTime() + offset * 86400000)

  return {
    year: result.getFullYear(),
    month: result.getMonth() + 1,
    day: result.getDate()
  }
}

/**
 * 获取年干支
 */
function getYearGanZhi(year) {
  const ganIndex = (year - 4) % 10
  const zhiIndex = (year - 4) % 12
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex]
}

/**
 * 获取生肖
 */
function getAnimal(year) {
  return ANIMALS[(year - 4) % 12]
}

/**
 * 获取星座
 */
function getConstellation(month, day) {
  const constellations = [
    { name: '摩羯座', start: [12, 22], end: [1, 19] },
    { name: '水瓶座', start: [1, 20], end: [2, 18] },
    { name: '双鱼座', start: [2, 19], end: [3, 20] },
    { name: '白羊座', start: [3, 21], end: [4, 19] },
    { name: '金牛座', start: [4, 20], end: [5, 20] },
    { name: '双子座', start: [5, 21], end: [6, 21] },
    { name: '巨蟹座', start: [6, 22], end: [7, 22] },
    { name: '狮子座', start: [7, 23], end: [8, 22] },
    { name: '处女座', start: [8, 23], end: [9, 22] },
    { name: '天秤座', start: [9, 23], end: [10, 23] },
    { name: '天蝎座', start: [10, 24], end: [11, 22] },
    { name: '射手座', start: [11, 23], end: [12, 21] }
  ]

  for (const c of constellations) {
    if (c.start[0] === 12 && c.end[0] === 1) {
      // 摩羯座跨年
      if ((month === 12 && day >= c.start[1]) || (month === 1 && day <= c.end[1])) {
        return c.name
      }
    } else if (month === c.start[0] && day >= c.start[1]) {
      return c.name
    } else if (month === c.end[0] && day <= c.end[1]) {
      return c.name
    }
  }
  return '摩羯座'
}

/**
 * 获取节气
 */
function getSolarTerms(year) {
  const terms = []
  for (let i = 0; i < 24; i++) {
    const termTime = new Date(31556925974.7 * (year - 1900) + SOLAR_TERM_INFO[i] * 60000 + Date.UTC(1900, 0, 6, 2, 5))
    terms.push({
      name: SOLAR_TERMS[i],
      date: termTime
    })
  }
  return terms
}

/**
 * 获取当前节气
 */
function getCurrentSolarTerm(year, month, day) {
  const terms = getSolarTerms(year)
  const targetDate = new Date(year, month - 1, day)

  for (let i = terms.length - 1; i >= 0; i--) {
    if (targetDate >= terms[i].date) {
      return terms[i].name
    }
  }
  return terms[0].name
}

/**
 * 获取下一个节气
 */
function getNextSolarTerm(year, month, day) {
  const terms = getSolarTerms(year)
  const targetDate = new Date(year, month - 1, day)

  for (let i = 0; i < terms.length; i++) {
    if (targetDate < terms[i].date) {
      return terms[i].name
    }
  }
  return terms[0].name + ' (明年)'
}

/**
 * 获取农历日名称
 */
function getLunarDayName(day) {
  return LUNAR_DAYS[day - 1] || ''
}

module.exports = {
  TIAN_GAN,
  DI_ZHI,
  ANIMALS,
  LUNAR_MONTHS,
  LUNAR_DAYS,
  solarToLunar,
  lunarToSolar,
  getYearGanZhi,
  getAnimal,
  getConstellation,
  getSolarTerms,
  getCurrentSolarTerm,
  getNextSolarTerm,
  getLunarDayName,
  getLunarYearDays,
  getLeapMonth,
  getLunarMonthDays
}
